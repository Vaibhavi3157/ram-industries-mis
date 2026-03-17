import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import machineRoutes from './routes/machines';
import operatorRoutes from './routes/operators';
import rawMaterialRoutes from './routes/rawMaterials';
import componentRoutes from './routes/components';
import mouldRoutes from './routes/moulds';
import bomRoutes from './routes/bom';
import productionPlanRoutes from './routes/productionPlans';
import productionReportRoutes from './routes/productionReports';
import dashboardRoutes from './routes/dashboard';
import packingMaterialRoutes from './routes/packingMaterials';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/machines', machineRoutes);
app.use('/api/operators', operatorRoutes);
app.use('/api/raw-materials', rawMaterialRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/moulds', mouldRoutes);
app.use('/api/bom', bomRoutes);
app.use('/api/production-plans', productionPlanRoutes);
app.use('/api/production-reports', productionReportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/packing-materials', packingMaterialRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Ram Industries API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
