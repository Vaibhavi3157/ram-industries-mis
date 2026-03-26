import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { productionReportsApi, type ProductionReport } from '@/services/api';

export function PrintReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const printRef = useRef<HTMLDivElement>(null);
  const [report, setReport] = useState<ProductionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const autoPrint = searchParams.get('autoPrint') === 'true';

  useEffect(() => {
    if (id) {
      fetchReport(id);
    }
  }, [id]);

  // Auto-trigger print when autoPrint=true and report is loaded
  useEffect(() => {
    if (autoPrint && report && !loading) {
      // Small delay to ensure page is fully rendered
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPrint, report, loading]);

  async function fetchReport(reportId: string) {
    try {
      setLoading(true);
      const data = await productionReportsApi.getById(reportId);
      setReport(data);
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  }

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p>Report not found</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Calculate totals from hourly data
  const hourlyData = report.hourlyData || [];
  const totalProduction = hourlyData.reduce((sum, h) => sum + (h.shotPerHour || 0), 0);
  const totalPlan = hourlyData.reduce((sum, h) => sum + (h.plan || 0), 0);

  const rejectionTotals = {
    L: hourlyData.reduce((sum, h) => sum + (h.rejectionL || 0), 0),
    M: hourlyData.reduce((sum, h) => sum + (h.rejectionM || 0), 0),
    N: hourlyData.reduce((sum, h) => sum + (h.rejectionN || 0), 0),
    O: hourlyData.reduce((sum, h) => sum + (h.rejectionO || 0), 0),
    P: hourlyData.reduce((sum, h) => sum + (h.rejectionP || 0), 0),
    Q: hourlyData.reduce((sum, h) => sum + (h.rejectionQ || 0), 0),
    R: hourlyData.reduce((sum, h) => sum + (h.rejectionR || 0), 0),
    S: hourlyData.reduce((sum, h) => sum + (h.rejectionS || 0), 0),
    T: hourlyData.reduce((sum, h) => sum + (h.rejectionT || 0), 0),
    U: hourlyData.reduce((sum, h) => sum + (h.rejectionU || 0), 0),
    W: hourlyData.reduce((sum, h) => sum + (h.rejectionW || 0), 0),
  };

  const totalRejection = Object.values(rejectionTotals).reduce((sum, v) => sum + v, 0);

  return (
    <>
      {/* Action Bar - Hidden in print */}
      <div className="print:hidden bg-white border-b sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button onClick={handlePrint} className="bg-blue-600">
            <Printer className="h-5 w-5 mr-2" />
            Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Printable Report */}
      <div ref={printRef} className="max-w-4xl mx-auto p-4 bg-white print:p-0 print:max-w-none">
        <style>{`
          @media print {
            @page {
              size: A4 landscape;
              margin: 10mm;
            }
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print-table {
              font-size: 9px;
            }
            .print-table th, .print-table td {
              padding: 2px 4px;
              border: 1px solid #000;
            }
          }
        `}</style>

        {/* Header */}
        <div className="text-center border-2 border-black mb-0">
          <h1 className="text-lg font-bold py-2 border-b-2 border-black bg-gray-100">
            RAM INDUSTRIES
          </h1>
          <h2 className="text-sm font-semibold py-1 bg-gray-50">
            DAILY PRODUCTION CUM INSPECTION REPORT
          </h2>
        </div>

        {/* Info Section */}
        <table className="w-full border-collapse border-2 border-black text-xs">
          <tbody>
            <tr>
              <td className="border border-black p-1 w-1/6 font-semibold bg-gray-50">Operator Name</td>
              <td className="border border-black p-1 w-1/6">{report.operator?.name || '-'}</td>
              <td className="border border-black p-1 w-1/6 font-semibold bg-gray-50">Component Name</td>
              <td className="border border-black p-1 w-1/6">{report.component?.name || '-'}</td>
              <td className="border border-black p-1 w-1/6 font-semibold bg-gray-50">Machine</td>
              <td className="border border-black p-1 w-1/6">{report.machine?.name || '-'}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-semibold bg-gray-50">Injection Time</td>
              <td className="border border-black p-1">{report.injectionTime || '-'} sec</td>
              <td className="border border-black p-1 font-semibold bg-gray-50">Cooling Time</td>
              <td className="border border-black p-1">{report.coolingTime || '-'} sec</td>
              <td className="border border-black p-1 font-semibold bg-gray-50">Date</td>
              <td className="border border-black p-1">{formatDate(report.date)}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-semibold bg-gray-50">Temperature</td>
              <td className="border border-black p-1" colSpan={3}>
                N: {report.temperatureN || '-'} |
                1: {report.temperature1 || '-'} |
                2: {report.temperature2 || '-'} |
                3: {report.temperature3 || '-'} |
                4: {report.temperature4 || '-'} |
                5: {report.temperature5 || '-'} |
                6: {report.temperature6 || '-'}
              </td>
              <td className="border border-black p-1 font-semibold bg-gray-50">Shift</td>
              <td className="border border-black p-1">{report.shift === 'DAY' ? 'Day' : 'Night'}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-semibold bg-gray-50">Material Name</td>
              <td className="border border-black p-1">{report.material?.name || '-'}</td>
              <td className="border border-black p-1 font-semibold bg-gray-50">Total Cavity</td>
              <td className="border border-black p-1">{report.totalCavity || '-'}</td>
              <td className="border border-black p-1 font-semibold bg-gray-50">Run Cavity</td>
              <td className="border border-black p-1">{report.runCavity || '-'}</td>
            </tr>
          </tbody>
        </table>

        {/* Hourly Production Table */}
        <table className="w-full border-collapse border-2 border-black text-xs print-table mt-0">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1" rowSpan={2}>HRS</th>
              <th className="border border-black p-1" rowSpan={2}>Reading</th>
              <th className="border border-black p-1" rowSpan={2}>Shot/Hr</th>
              <th className="border border-black p-1" rowSpan={2}>Plan</th>
              <th className="border border-black p-1 text-center" colSpan={11}>REJECTION</th>
              <th className="border border-black p-1" rowSpan={2}>Check<br/>Point</th>
              <th className="border border-black p-1" rowSpan={2}>Obs<br/>Sample</th>
            </tr>
            <tr className="bg-gray-100">
              <th className="border border-black p-1">L</th>
              <th className="border border-black p-1">M</th>
              <th className="border border-black p-1">N</th>
              <th className="border border-black p-1">O</th>
              <th className="border border-black p-1">P</th>
              <th className="border border-black p-1">Q</th>
              <th className="border border-black p-1">R</th>
              <th className="border border-black p-1">S</th>
              <th className="border border-black p-1">T</th>
              <th className="border border-black p-1">U</th>
              <th className="border border-black p-1">W</th>
            </tr>
          </thead>
          <tbody>
            {[7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6].map((hour) => {
              const hourData = hourlyData.find(h => h.hour === hour || h.hour === (hour < 7 ? hour + 12 : hour));
              return (
                <tr key={hour}>
                  <td className="border border-black p-1 text-center font-semibold">{hour}</td>
                  <td className="border border-black p-1 text-center">{hourData?.reading || ''}</td>
                  <td className="border border-black p-1 text-center">{hourData?.shotPerHour || ''}</td>
                  <td className="border border-black p-1 text-center">{hourData?.plan || ''}</td>
                  <td className="border border-black p-1 text-center">{hourData?.rejectionL || ''}</td>
                  <td className="border border-black p-1 text-center">{hourData?.rejectionM || ''}</td>
                  <td className="border border-black p-1 text-center">{hourData?.rejectionN || ''}</td>
                  <td className="border border-black p-1 text-center">{hourData?.rejectionO || ''}</td>
                  <td className="border border-black p-1 text-center">{hourData?.rejectionP || ''}</td>
                  <td className="border border-black p-1 text-center">{hourData?.rejectionQ || ''}</td>
                  <td className="border border-black p-1 text-center">{hourData?.rejectionR || ''}</td>
                  <td className="border border-black p-1 text-center">{hourData?.rejectionS || ''}</td>
                  <td className="border border-black p-1 text-center">{hourData?.rejectionT || ''}</td>
                  <td className="border border-black p-1 text-center">{hourData?.rejectionU || ''}</td>
                  <td className="border border-black p-1 text-center">{hourData?.rejectionW || ''}</td>
                  <td className="border border-black p-1 text-center">{hourData?.checkPoint || ''}</td>
                  <td className="border border-black p-1 text-center">{hourData?.obsSample || ''}</td>
                </tr>
              );
            })}
            {/* Total Row */}
            <tr className="bg-gray-100 font-bold">
              <td className="border border-black p-1 text-center">TOTAL</td>
              <td className="border border-black p-1 text-center">-</td>
              <td className="border border-black p-1 text-center">{totalProduction}</td>
              <td className="border border-black p-1 text-center">{totalPlan}</td>
              <td className="border border-black p-1 text-center">{rejectionTotals.L || ''}</td>
              <td className="border border-black p-1 text-center">{rejectionTotals.M || ''}</td>
              <td className="border border-black p-1 text-center">{rejectionTotals.N || ''}</td>
              <td className="border border-black p-1 text-center">{rejectionTotals.O || ''}</td>
              <td className="border border-black p-1 text-center">{rejectionTotals.P || ''}</td>
              <td className="border border-black p-1 text-center">{rejectionTotals.Q || ''}</td>
              <td className="border border-black p-1 text-center">{rejectionTotals.R || ''}</td>
              <td className="border border-black p-1 text-center">{rejectionTotals.S || ''}</td>
              <td className="border border-black p-1 text-center">{rejectionTotals.T || ''}</td>
              <td className="border border-black p-1 text-center">{rejectionTotals.U || ''}</td>
              <td className="border border-black p-1 text-center">{rejectionTotals.W || ''}</td>
              <td className="border border-black p-1 text-center">-</td>
              <td className="border border-black p-1 text-center">-</td>
            </tr>
          </tbody>
        </table>

        {/* Rejection Codes Legend */}
        <div className="border-x-2 border-black text-xs p-1 bg-gray-50">
          <span className="font-semibold">Rejection Codes: </span>
          L-Silver Mark, M-Warpage, N-Weldline, O-Black Spot, P-Dent Mark, Q-Silk Mark, R-Shade Variation, S-Half Shot, T-Flow Mark, U-Scratches/Cracks, W-Ejector Pin Mark
        </div>

        {/* Downtime Section */}
        <table className="w-full border-collapse border-2 border-black text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1" colSpan={4}>DOWNTIME DETAILS</th>
              <th className="border border-black p-1" colSpan={6}>CODE DETAILS</th>
            </tr>
            <tr className="bg-gray-50">
              <th className="border border-black p-1">From</th>
              <th className="border border-black p-1">To</th>
              <th className="border border-black p-1">Code</th>
              <th className="border border-black p-1">Remarks</th>
              <th className="border border-black p-1" colSpan={6}>
                A-No Power, B-Mould Change, C-No Raw Material, D-No Man Power, E-No Programme, F-Machine Maint., G-Mould Maint., H-Trial, I-Barrel Heating, J-Nozzle Block, K-Color Change, L-Other
              </th>
            </tr>
          </thead>
          <tbody>
            {(report.downtimeLogs && report.downtimeLogs.length > 0) ? (
              report.downtimeLogs.map((log, i) => (
                <tr key={i}>
                  <td className="border border-black p-1 text-center">{log.fromTime}</td>
                  <td className="border border-black p-1 text-center">{log.toTime}</td>
                  <td className="border border-black p-1 text-center">{log.downtimeCode?.code || '-'}</td>
                  <td className="border border-black p-1" colSpan={7}>{log.remarks || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border border-black p-1 text-center" colSpan={10}>No downtime recorded</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Summary Section */}
        <table className="w-full border-collapse border-2 border-black text-xs">
          <tbody>
            <tr>
              <td className="border border-black p-2 w-1/4 font-semibold bg-gray-50">Remarks</td>
              <td className="border border-black p-2 w-1/4">{report.remarks || '-'}</td>
              <td className="border border-black p-2 w-1/6 font-semibold bg-green-100 text-center">OK Production</td>
              <td className="border border-black p-2 w-1/12 text-center font-bold text-green-700">{report.okProduction}</td>
              <td className="border border-black p-2 w-1/6 font-semibold bg-red-100 text-center">Rejection Qty</td>
              <td className="border border-black p-2 w-1/12 text-center font-bold text-red-700">{totalRejection}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-semibold bg-gray-50">Operator Sign</td>
              <td className="border border-black p-2">{report.operatorSign ? '✓ Signed' : ''}</td>
              <td className="border border-black p-2 font-semibold bg-gray-50" colSpan={2}>Supervisor Sign</td>
              <td className="border border-black p-2" colSpan={2}>{report.supervisorSign ? '✓ Signed' : ''}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
