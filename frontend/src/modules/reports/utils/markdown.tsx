import React from 'react';

/*
 * Renderizador mínimo de Markdown (títulos, listas, párrafos, negrita, cursiva y código).
 * Construye elementos React en lugar de HTML, así el texto del LLM nunca se inyecta como markup.
 */

const INLINE = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*\s][^*]*\*|(?<!\w)_[^_\s][^_]*_(?!\w)|`[^`]+`)/g;

const celdasTabla = (linea: string) => linea.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map(celda => celda.trim().replace(/\\\|/g, '|'));
const esSeparadorTabla = (linea: string) => linea.includes('|') && celdasTabla(linea).every(celda => /^:?-{3,}:?$/.test(celda));

const renderInline = (text: string, keyPrefix: string): React.ReactNode[] =>
  text.split(INLINE).filter(Boolean).map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={key} style={{ fontFamily: 'monospace', backgroundColor: 'var(--bg-primary)', padding: '1px 5px', borderRadius: '4px' }}>
          {part.slice(1, -1)}
        </code>
      );
    }
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });

export const renderMarkdown = (markdown: string): React.ReactNode[] => {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      const key = `p-${blocks.length}`;
      blocks.push(<p key={key} style={{ lineHeight: 1.7 }}>{renderInline(paragraph.join(' '), key)}</p>);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list) {
      const key = `l-${blocks.length}`;
      const items = list.items.map((item, i) => <li key={`${key}-${i}`}>{renderInline(item, `${key}-${i}`)}</li>);
      const style = { paddingLeft: '1.5rem', lineHeight: 1.7 };
      blocks.push(list.ordered ? <ol key={key} style={style}>{items}</ol> : <ul key={key} style={style}>{items}</ul>);
      list = null;
    }
  };

  for (let indice = 0; indice < lines.length; indice++) {
    const line = lines[indice].trim();
    if (line.includes('|') && indice + 1 < lines.length && esSeparadorTabla(lines[indice + 1])) {
      flushParagraph();
      flushList();
      const cabeceras = celdasTabla(line);
      const filas: string[][] = [];
      indice += 2;
      while (indice < lines.length && lines[indice].trim() && lines[indice].includes('|')) {
        filas.push(celdasTabla(lines[indice]));
        indice++;
      }
      indice--;
      const clave = `tabla-${blocks.length}`;
      blocks.push(<div key={clave} className="reporte-tabla-markdown"><table>
        <thead><tr>{cabeceras.map((celda, i) => <th scope="col" key={i}>{renderInline(celda, `${clave}-h-${i}`)}</th>)}</tr></thead>
        <tbody>{filas.map((fila, i) => <tr key={i}>{cabeceras.map((_, j) =>
          <td key={j}>{renderInline(fila[j] || '', `${clave}-${i}-${j}`)}</td>)}</tr>)}</tbody>
      </table></div>);
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    const bullet = line.match(/^[-*+]\s+(.*)$/);
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);

    if (!line) {
      flushParagraph();
      flushList();
    } else if (heading) {
      flushParagraph();
      flushList();
      const key = `h-${blocks.length}`;
      const size = ['1.4rem', '1.2rem', '1.05rem', '1rem'][heading[1].length - 1];
      blocks.push(<h3 key={key} style={{ fontSize: size, margin: '0.5rem 0' }}>{renderInline(heading[2], key)}</h3>);
    } else if (bullet || numbered) {
      flushParagraph();
      const ordered = Boolean(numbered);
      if (list && list.ordered !== ordered) flushList();
      if (!list) list = { ordered, items: [] };
      list.items.push((bullet || numbered)![1]);
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  return blocks;
};

/** Texto plano para la síntesis de voz: sin símbolos de Markdown. */
export const stripMarkdown = (markdown: string): string =>
  markdown
    .replace(/^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/gm, '')
    .replace(/\|/g, ', ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/_/g, ' ')
    .replace(/\n{2,}/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
