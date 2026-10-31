import java.io.File;
import org.bonitasoft.engine.bpm.bar.BusinessArchive;
import org.bonitasoft.engine.bpm.bar.BusinessArchiveBuilder;
import org.bonitasoft.engine.bpm.bar.BusinessArchiveFactory;
import org.bonitasoft.engine.bpm.bar.actorMapping.Actor;
import org.bonitasoft.engine.bpm.bar.actorMapping.ActorMapping;
import org.bonitasoft.engine.bpm.bar.form.model.FormMappingDefinition;
import org.bonitasoft.engine.bpm.bar.form.model.FormMappingModel;
import org.bonitasoft.engine.bpm.contract.Type;
import org.bonitasoft.engine.bpm.process.DesignProcessDefinition;
import org.bonitasoft.engine.bpm.process.impl.ProcessDefinitionBuilder;
import org.bonitasoft.engine.bpm.process.impl.UserTaskDefinitionBuilder;
import org.bonitasoft.engine.expression.ExpressionBuilder;
import org.bonitasoft.engine.form.FormMappingTarget;
import org.bonitasoft.engine.form.FormMappingType;
import org.bonitasoft.engine.operation.OperationBuilder;

/** Genera AtencionIncidentesRed--1.0.bar (proceso de atención de incidentes de red de Mi Red). */
public class BuildBar {
    static final String PROCESS = "AtencionIncidentesRed";
    static final String VERSION = "1.0";
    static final String TASK = "Resolver incidente";
    static final String GROUP = "/soporte_redes";

    public static void main(String[] args) throws Exception {
        ExpressionBuilder ex = new ExpressionBuilder();
        String LONG = Long.class.getName();
        String STR = String.class.getName();

        ProcessDefinitionBuilder p = new ProcessDefinitionBuilder().createNewInstance(PROCESS, VERSION);
        p.addDescription("Atención y escalamiento de incidentes de red clasificados por el modelo de ML");
        p.addActor("Solicitante", true);
        p.addActor("TecnicoRedes");

        // Contrato de instanciación (UC-BE-06)
        p.addContract()
            .addInput("ticketId", Type.LONG, "ID del ticket en PostgreSQL")
            .addInput("categoria", Type.TEXT, "Categoría predecida por el modelo de ML")
            .addInput("prioridad", Type.TEXT, "Prioridad sugerida (Alta/Media/Baja)")
            .addInput("usuarioAsignado", Type.TEXT, "Usuario o grupo asignado");

        // Variables de proceso inicializadas desde el contrato
        p.addData("ticketId", LONG, ex.createContractInputExpression("ticketId", LONG));
        p.addData("categoria", STR, ex.createContractInputExpression("categoria", STR));
        p.addData("prioridad", STR, ex.createContractInputExpression("prioridad", STR));
        p.addData("usuarioAsignado", STR, ex.createContractInputExpression("usuarioAsignado", STR));
        p.addData("comentarioTecnico", STR, null);

        p.addStartEvent("Inicio");
        UserTaskDefinitionBuilder task = p.addUserTask(TASK, "TecnicoRedes");
        task.addContract().addInput("comentarioTecnico", Type.TEXT, "Nota técnica de la resolución");
        task.addOperation(new OperationBuilder().createSetDataOperation(
            "comentarioTecnico", ex.createContractInputExpression("comentarioTecnico", STR)));
        p.addEndEvent("Fin");
        p.addTransition("Inicio", TASK);
        p.addTransition(TASK, "Fin");

        DesignProcessDefinition design = p.done();

        ActorMapping mapping = new ActorMapping();
        for (String actorName : new String[] {"Solicitante", "TecnicoRedes"}) {
            Actor actor = new Actor(actorName);
            actor.addGroup(GROUP);
            mapping.addActor(actor);
        }

        // Sin formularios: el proceso se opera por la API REST
        FormMappingModel forms = new FormMappingModel();
        forms.addFormMapping(new FormMappingDefinition(null, FormMappingType.PROCESS_START, FormMappingTarget.NONE));
        forms.addFormMapping(new FormMappingDefinition(null, FormMappingType.PROCESS_OVERVIEW, FormMappingTarget.NONE));
        forms.addFormMapping(new FormMappingDefinition(null, FormMappingType.TASK, FormMappingTarget.NONE, TASK));

        BusinessArchive bar = new BusinessArchiveBuilder().createNewBusinessArchive()
            .setProcessDefinition(design)
            .setActorMapping(mapping)
            .setFormMappings(forms)
            .done();

        File out = new File(args.length > 0 ? args[0] : PROCESS + "--" + VERSION + ".bar");
        out.delete();
        BusinessArchiveFactory.writeBusinessArchiveToFile(bar, out);
        System.out.println("BAR generado: " + out.getAbsolutePath());
    }
}
