import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Machines } from '@/pages/masters/Machines';
import { Operators } from '@/pages/masters/Operators';
import { RawMaterials } from '@/pages/masters/RawMaterials';
import { Components } from '@/pages/masters/Components';
import { Moulds } from '@/pages/masters/Moulds';
import { BOM } from '@/pages/masters/BOM';
import { PackingMaterials } from '@/pages/masters/PackingMaterials';
import { DailyPlan } from '@/pages/planning/DailyPlan';
import { ProductionEntry } from '@/pages/production/ProductionEntry';
import { ProductionList } from '@/pages/production/ProductionList';
import { PrintReport } from '@/pages/production/PrintReport';
import { DailyReport } from '@/pages/reports/DailyReport';
import { MachineAnalysis } from '@/pages/reports/MachineAnalysis';
import { OperatorAnalysis } from '@/pages/reports/OperatorAnalysis';
import { RejectionAnalysis } from '@/pages/reports/RejectionAnalysis';
import { DowntimeAnalysis } from '@/pages/reports/DowntimeAnalysis';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />

          {/* Masters */}
          <Route path="masters/machines" element={<Machines />} />
          <Route path="masters/operators" element={<Operators />} />
          <Route path="masters/materials" element={<RawMaterials />} />
          <Route path="masters/components" element={<Components />} />
          <Route path="masters/moulds" element={<Moulds />} />
          <Route path="masters/packing-materials" element={<PackingMaterials />} />
          <Route path="masters/bom" element={<BOM />} />

          {/* Planning */}
          <Route path="planning" element={<DailyPlan />} />

          {/* Production */}
          <Route path="production/new" element={<ProductionEntry />} />
          <Route path="production/list" element={<ProductionList />} />
          <Route path="production/print/:id" element={<PrintReport />} />

          {/* Reports */}
          <Route path="reports/daily" element={<DailyReport />} />
          <Route path="reports/machine" element={<MachineAnalysis />} />
          <Route path="reports/operator" element={<OperatorAnalysis />} />
          <Route path="reports/rejection" element={<RejectionAnalysis />} />
          <Route path="reports/downtime" element={<DowntimeAnalysis />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
