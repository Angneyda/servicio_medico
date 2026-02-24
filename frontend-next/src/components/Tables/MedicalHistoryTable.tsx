import Loader from '../../common/Loader';
import useMedicalHistory from '../../hooks/useMedicalHistory';

const MedicalHistoryTable = () => {
  const { history, loading, error } = useMedicalHistory();

  if (loading) return <Loader />;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Historias Médicas Recientes
      </h4>

      <div className="flex flex-col">
        {/* Encabezados de la Tabla */}
        <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-3">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Paciente
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Fecha de Consulta
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Diagnóstico
            </h5>
          </div>
        </div>

        {/* Filas de Datos */}
        {history.length === 0 ? (
           <div className="p-5 text-center text-gray-500">No hay historias médicas registradas.</div>
        ) : (
          history.map((record, key) => (
            <div
              className={`grid grid-cols-3 sm:grid-cols-3 ${
                key === history.length - 1
                  ? ''
                  : 'border-b border-stroke dark:border-strokedark'
              }`}
              key={key}
            >
              <div className="flex items-center gap-3 p-2.5 xl:p-5">
                <p className="text-black dark:text-white pb-2">
                  {record.paciente_nombre}
                </p>
              </div>

              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <p className="text-black dark:text-white">{record.fecha_consulta}</p>
              </div>

              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <p className="text-meta-3">{record.diagnostico}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MedicalHistoryTable;
