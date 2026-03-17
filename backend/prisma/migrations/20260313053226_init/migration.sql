-- CreateTable
CREATE TABLE "Machine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IDLE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Operator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "shift" TEXT NOT NULL DEFAULT 'DAY',
    "machineId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Operator_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RawMaterial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "grade" TEXT NOT NULL DEFAULT '',
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "currentStock" REAL NOT NULL DEFAULT 0,
    "minStock" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Component" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "totalCavity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Mould" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "totalCavity" INTEGER NOT NULL DEFAULT 1,
    "runCavity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Mould_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BOM" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "componentId" TEXT NOT NULL,
    "rawMaterialId" TEXT NOT NULL,
    "weightPerPiece" REAL NOT NULL,
    "runnerWeight" REAL NOT NULL,
    "cycleTime" INTEGER NOT NULL,
    "packingMaterial" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BOM_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BOM_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RejectionType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "DowntimeCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OPERATOR',
    "shift" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProductionPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "shift" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "mouldId" TEXT NOT NULL,
    "targetShots" INTEGER NOT NULL,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductionPlan_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductionPlan_mouldId_fkey" FOREIGN KEY ("mouldId") REFERENCES "Mould" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductionPlan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductionReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "shift" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "mouldId" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "injectionTime" REAL,
    "coolingTime" REAL,
    "totalCavity" INTEGER,
    "runCavity" INTEGER,
    "temperatureN" REAL,
    "temperature1" REAL,
    "temperature2" REAL,
    "temperature3" REAL,
    "temperature4" REAL,
    "temperature5" REAL,
    "temperature6" REAL,
    "processParameter" TEXT,
    "okProduction" INTEGER NOT NULL DEFAULT 0,
    "totalRejection" INTEGER NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "operatorSign" BOOLEAN NOT NULL DEFAULT false,
    "supervisorSign" BOOLEAN NOT NULL DEFAULT false,
    "supervisorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductionReport_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductionReport_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductionReport_mouldId_fkey" FOREIGN KEY ("mouldId") REFERENCES "Mould" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductionReport_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductionReport_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "RawMaterial" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductionReport_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HourlyProduction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "hour" INTEGER NOT NULL,
    "reading" INTEGER NOT NULL DEFAULT 0,
    "shotPerHour" INTEGER NOT NULL DEFAULT 0,
    "plan" INTEGER NOT NULL DEFAULT 0,
    "rejectionL" INTEGER NOT NULL DEFAULT 0,
    "rejectionM" INTEGER NOT NULL DEFAULT 0,
    "rejectionN" INTEGER NOT NULL DEFAULT 0,
    "rejectionO" INTEGER NOT NULL DEFAULT 0,
    "rejectionP" INTEGER NOT NULL DEFAULT 0,
    "rejectionQ" INTEGER NOT NULL DEFAULT 0,
    "rejectionR" INTEGER NOT NULL DEFAULT 0,
    "rejectionS" INTEGER NOT NULL DEFAULT 0,
    "rejectionT" INTEGER NOT NULL DEFAULT 0,
    "rejectionU" INTEGER NOT NULL DEFAULT 0,
    "rejectionW" INTEGER NOT NULL DEFAULT 0,
    "checkPoint" TEXT,
    "obsSample" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "HourlyProduction_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ProductionReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DowntimeLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "fromTime" TEXT NOT NULL,
    "toTime" TEXT NOT NULL,
    "totalMinutes" INTEGER NOT NULL DEFAULT 0,
    "downtimeCodeId" TEXT NOT NULL,
    "remarks" TEXT,
    CONSTRAINT "DowntimeLog_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ProductionReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DowntimeLog_downtimeCodeId_fkey" FOREIGN KEY ("downtimeCodeId") REFERENCES "DowntimeCode" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Machine_name_key" ON "Machine"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Operator_phone_key" ON "Operator"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "RawMaterial_name_key" ON "RawMaterial"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Component_name_key" ON "Component"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Mould_name_key" ON "Mould"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BOM_componentId_rawMaterialId_key" ON "BOM"("componentId", "rawMaterialId");

-- CreateIndex
CREATE UNIQUE INDEX "RejectionType_code_key" ON "RejectionType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DowntimeCode_code_key" ON "DowntimeCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionPlan_date_shift_machineId_key" ON "ProductionPlan"("date", "shift", "machineId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionReport_date_shift_machineId_key" ON "ProductionReport"("date", "shift", "machineId");

-- CreateIndex
CREATE UNIQUE INDEX "HourlyProduction_reportId_hour_key" ON "HourlyProduction"("reportId", "hour");
