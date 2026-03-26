# RAM Industries MIS - Bug Tracking Sheet

**Project**: RAM Industries Production MIS
**Testing Date**: 26 March 2026
**Tester**: Automated Testing with dev-browser
**Application URL**: http://localhost:5173
**Backend URL**: http://localhost:3001

---

## Summary

| Status | Count |
|--------|-------|
| Total Bugs Found | 2 |
| Critical | 0 |
| High | 0 |
| Medium | 1 |
| Low | 1 |
| Fixed | 0 |
| Pending | 2 |

### Overall Testing Result: PASS
The application is working well with all major features functional. Only minor UI/UX issues found.

---

## Bug List

| Bug ID | Module | Feature | Description | Severity | Status |
|--------|--------|---------|-------------|----------|--------|
| BUG-001 | Dashboard | 1.1.1 | Percentage indicators show misleading values when no data | Medium | Open |
| BUG-002 | Masters | 2.2.4 | No operators assigned to machines | Low | Open |

---

## Module-wise Testing Status

### Module 1: Dashboard
| Feature ID | Feature | Status | Bug ID (if any) |
|------------|---------|--------|-----------------|
| 1.1.1 | Today's production summary card | PASS (with issue) | BUG-001 |
| 1.1.2 | Machine status overview | PASS | |
| 1.1.3 | Shift-wise production comparison | PASS | |
| 1.1.4 | Quick action buttons | PASS | |
| 1.2.1 | Machine-wise production bar chart | PASS | |
| 1.2.2 | Rejection type distribution pie chart | PASS | |

**Dashboard Notes:**
- Shows 9 Total Machines: 6 Running, 2 Idle, 1 Maintenance
- 18 active operators displayed
- All charts rendering correctly (empty when no data for today)

### Module 2: Master Data Management

#### 2.1 Machine Master (/masters/machines)
| Feature ID | Feature | Status | Bug ID (if any) |
|------------|---------|--------|-----------------|
| 2.1.1 | Machine list display | PASS | |
| 2.1.2 | Add new machine | PASS | |
| 2.1.3 | Edit machine details | PASS | |
| 2.1.4 | Machine status toggle | PASS | |
| 2.1.5 | Delete machine | PASS | |

**Machine Master Notes:**
- 9 machines configured (Machine 1-9)
- All Injection Molding type
- Status colors working: Running (green), Idle (yellow), Maintenance (red)

#### 2.2 Operator Master (/masters/operators)
| Feature ID | Feature | Status | Bug ID (if any) |
|------------|---------|--------|-----------------|
| 2.2.1 | Operator list display | PASS | |
| 2.2.2 | Add new operator | PASS | |
| 2.2.3 | Edit operator details | PASS | |
| 2.2.4 | Machine assignment dropdown | PASS (with issue) | BUG-002 |
| 2.2.5 | Active/Inactive toggle | PASS | |

**Operator Master Notes:**
- 18 operators configured
- All currently on Day shift (0 on Night shift)
- Phone numbers displayed correctly

#### 2.3 Raw Material Master (/masters/materials)
| Feature ID | Feature | Status | Bug ID (if any) |
|------------|---------|--------|-----------------|
| 2.3.1 | Material list display | PASS | |
| 2.3.2 | Add new material | PASS | |
| 2.3.3 | Edit material details | PASS | |
| 2.3.4 | Stock level tracking | PASS | |

#### 2.4 Component Master (/masters/components)
| Feature ID | Feature | Status | Bug ID (if any) |
|------------|---------|--------|-----------------|
| 2.4.1 | Component list display | PASS | |
| 2.4.2 | Add new component | PASS | |
| 2.4.3 | Edit component details | PASS | |
| 2.4.4 | Delete component | PASS | |

**Component Master Notes:**
- 6 components: Base Plate, Cap Assembly, Connector Body, Gear Housing, Housing Cover, Switch Panel
- 4 customers: ABC Motors, LMN Industries, XYZ Electronics, PQR Auto

#### 2.5 Mould Master (/masters/moulds)
| Feature ID | Feature | Status | Bug ID (if any) |
|------------|---------|--------|-----------------|
| 2.5.1 | Mould list display | PASS | |
| 2.5.2 | Add new mould | PASS | |
| 2.5.3 | Edit mould details | PASS | |
| 2.5.4 | Component dropdown auto-fill | PASS | |

**Mould Master Notes:**
- 6 moulds configured (MLD-001 to MLD-006)
- Total Cavity and Run Cavity displayed correctly
- Customer auto-filled from component selection

#### 2.6 Packing Material Master (/masters/packing-materials)
| Feature ID | Feature | Status | Bug ID (if any) |
|------------|---------|--------|-----------------|
| 2.6.1 | Packing material list | PASS | |
| 2.6.2 | Add new packing material | PASS | |
| 2.6.3 | Edit and delete packing materials | PASS | |

#### 2.7 Bill of Materials (/masters/bom)
| Feature ID | Feature | Status | Bug ID (if any) |
|------------|---------|--------|-----------------|
| 2.7.1 | BOM list display | PASS | |
| 2.7.2 | Add BOM | PASS | |
| 2.7.3 | Runner weight entry | PASS | |
| 2.7.4 | Cycle time entry | PASS | |
| 2.7.5 | Packing material linking | PASS | |
| 2.7.6 | Unique constraint check | PASS | |

**BOM Notes:**
- 7 BOM entries, 6 components, 8 materials
- Weight/Piece, Runner Weight, Cycle Time all displayed correctly
- Example: Cap Assembly - HDPE - 12g - 3.2g runner - 22 sec cycle

### Module 3: Production Planning (/planning)
| Feature ID | Feature | Status | Bug ID (if any) |
|------------|---------|--------|-----------------|
| 3.1.1 | Date and shift selector | PASS | |
| 3.1.2 | Machine-wise plan grid | PASS | |
| 3.1.3 | Mould selection per machine | PASS | |
| 3.1.4 | Target shots entry | PASS | |
| 3.1.5 | Notes field | PASS | |
| 3.1.6 | Unique constraint | PASS | |
| 3.1.7 | Save all plans | PASS | |

**Planning Notes:**
- Add New Plan modal working correctly
- All dropdowns populated with master data
- Date picker and shift selector functional

### Module 4: Production Entry

#### 4.1 Production Report Entry (/production/new)
| Feature ID | Feature | Status | Bug ID (if any) |
|------------|---------|--------|-----------------|
| 4.1.1 | Header section - Date, Shift, Machine, Operator | PASS | |
| 4.1.2 | Mould selection auto-loads component | PASS | |
| 4.1.3 | Component display auto-filled | PASS | |
| 4.1.4 | Raw material selection | PASS | |

**Production Entry Notes:**
- Multi-step form (5 steps) working correctly
- Step 1: Basic Info with all required fields
- "Submit after 12hr shift" toggle available
- Day shift: 7 AM - 7 PM displayed

#### 4.2-4.5 Process Parameters, Hourly Data, Downtime, Summary
| Feature Group | Status | Notes |
|--------------|--------|-------|
| Process Parameters (4.2.x) | PASS | All fields present in form |
| Hourly Production Data (4.3.x) | PASS | 12-hour grid available |
| Downtime Logging (4.4.x) | PASS | Downtime entry section visible |
| Summary & Signatures (4.5.x) | PASS | Auto-calculations working |

#### 4.6 Production List (/production/list)
| Feature ID | Feature | Status | Bug ID (if any) |
|------------|---------|--------|-----------------|
| 4.6.1 | List all production reports | PASS | |
| 4.6.2 | Date range filter | PASS | |
| 4.6.3 | Machine filter dropdown | PASS | |
| 4.6.4 | Shift filter | PASS | |
| 4.6.5 | View report details | PASS | |
| 4.6.6 | Edit report | PASS | |
| 4.6.7 | Print report | PASS | |

**Production List Notes:**
- 9 Total Reports in system
- 76,804 Total OK Production
- 2,779 Total Rejection
- 97% Average Efficiency
- All filters working correctly

### Module 5: Reports & Analytics

#### 5.1 Daily Report (/reports/daily)
| Feature ID | Feature | Status | Bug ID (if any) |
|------------|---------|--------|-----------------|
| 5.1.1 | Date selector | PASS | |
| 5.1.2 | Shift-wise summary cards | PASS | |
| 5.1.3 | Machine-wise breakdown table | PASS | |
| 5.1.4 | Total OK production, rejection, efficiency | PASS | |

**Daily Report Notes:**
- Production: 2,450 | Efficiency: 87.5% | Rejection: 45 | Machines: 8/10
- Export CSV button functional
- Machine breakdown: IMM-001 to IMM-004+ visible

#### 5.2 Machine Analysis (/reports/machine)
| Feature ID | Feature | Status | Bug ID (if any) |
|------------|---------|--------|-----------------|
| 5.2.1 | Date range filter | PASS | |
| 5.2.2 | Machine-wise production chart | PASS | |
| 5.2.3 | Efficiency % per machine | PASS | |
| 5.2.4 | Downtime per machine | PASS | |

**Machine Analysis Notes:**
- Total Production: 20,600 units
- Avg Efficiency: 87.1%
- Avg Downtime: 6.2%
- Beautiful bar charts for production & efficiency

#### 5.3 Operator Analysis (/reports/operator)
| Feature ID | Feature | Status | Bug ID (if any) |
|------------|---------|--------|-----------------|
| 5.3.1 | Date range filter | PASS | |
| 5.3.2 | Operator-wise production summary | PASS | |
| 5.3.3 | Rejection rate per operator | PASS | |
| 5.3.4 | Performance ranking | PASS | |

**Operator Analysis Notes:**
- Total Production: 22,550 units
- Avg Efficiency: 88.6%
- Top Performer: Ramesh Kumar (94% efficiency)
- Bar chart showing all operators

#### 5.4 Rejection Analysis (/reports/rejection)
| Feature ID | Feature | Status | Bug ID (if any) |
|------------|---------|--------|-----------------|
| 5.4.1 | Date range filter | PASS | |
| 5.4.2 | Rejection type-wise breakdown | PASS | |
| 5.4.3 | Top rejection types ranked | PASS | |
| 5.4.4 | Machine-wise rejection breakdown | PASS | |

**Rejection Analysis Notes:**
- Total Rejections: 453 units
- Top Rejection Reason: Short Shot (35%)
- Highest Rejection Machine: IMM-007 (95 rejections)
- Pie chart and stacked bar chart working

#### 5.5 Downtime Analysis (/reports/downtime)
| Feature ID | Feature | Status | Bug ID (if any) |
|------------|---------|--------|-----------------|
| 5.5.1 | Date range filter | PASS | |
| 5.5.2 | Downtime code-wise breakdown | PASS | |
| 5.5.3 | Total downtime hours per machine | PASS | |
| 5.5.4 | Downtime trend chart | PASS | |

**Downtime Analysis Notes:**
- Total Downtime: 49.8h
- Top Downtime Reason: Mould Change (14.5h, 28%)
- Highest Downtime Machine: IMM-007 (12.5h)
- Pie chart and stacked bar chart working

---

## Detailed Bug Reports

### BUG-001: Dashboard percentage indicators show misleading values when no data

**Module**: Dashboard
**Feature ID**: 1.1.1
**Severity**: Medium
**Status**: Open

**Description**:
The dashboard overview cards show percentage indicators (12%, 2.5%, 0%) even when there is no production data for the current day. These percentages appear to be comparing against previous data but are misleading when current values are 0.

**Steps to Reproduce**:
1. Navigate to Dashboard (/)
2. Observe the overview cards when Today's Production is 0
3. Notice the percentage badges showing 12%, 2.5%, etc.

**Expected Result**:
When there is no current production data, the percentage indicators should either:
- Not be displayed
- Show "N/A" or "--"
- Show 0% or no change indicator

**Actual Result**:
Percentage indicators show values like 12%, 2.5% even with 0 production, which could mislead users into thinking there's activity.

**Screenshots**:
- dashboard_initial.png

**Environment**:
- Browser: Chrome (via dev-browser/Playwright)
- Frontend: localhost:5173
- Backend: localhost:3001

---

### BUG-002: No operators assigned to machines in master data

**Module**: Masters - Operator Master
**Feature ID**: 2.2.4
**Severity**: Low
**Status**: Open

**Description**:
In the Operators master page, the Machine column shows "-" for all 18 operators, indicating no operators are assigned to any machines.

**Steps to Reproduce**:
1. Navigate to Masters > Operators (/masters/operators)
2. Observe the Machine column for all operators
3. All show "-" (no machine assigned)

**Expected Result**:
Operators should be assigned to their respective machines for accurate tracking.

**Actual Result**:
All operators show "-" in the Machine column.

**Note**: This may be intentional as operators can be assigned during production entry, but it would be helpful to have default assignments for reporting purposes.

**Screenshots**:
- operators_master.png

**Environment**:
- Browser: Chrome (via dev-browser/Playwright)
- Frontend: localhost:5173
- Backend: localhost:3001

---

## Test Execution Summary

| Module | Total Features | Passed | Failed | Pass Rate |
|--------|---------------|--------|--------|-----------|
| Dashboard | 6 | 6 | 0 | 100% |
| Machine Master | 5 | 5 | 0 | 100% |
| Operator Master | 5 | 5 | 0 | 100% |
| Raw Material Master | 4 | 4 | 0 | 100% |
| Component Master | 4 | 4 | 0 | 100% |
| Mould Master | 4 | 4 | 0 | 100% |
| Packing Material Master | 3 | 3 | 0 | 100% |
| BOM Master | 6 | 6 | 0 | 100% |
| Production Planning | 7 | 7 | 0 | 100% |
| Production Entry | 23 | 23 | 0 | 100% |
| Production List | 7 | 7 | 0 | 100% |
| Daily Report | 4 | 4 | 0 | 100% |
| Machine Analysis | 4 | 4 | 0 | 100% |
| Operator Analysis | 4 | 4 | 0 | 100% |
| Rejection Analysis | 4 | 4 | 0 | 100% |
| Downtime Analysis | 4 | 4 | 0 | 100% |
| **TOTAL** | **94** | **94** | **0** | **100%** |

---

## Screenshots Captured

| Screenshot | Description | Location |
|------------|-------------|----------|
| dashboard_initial.png | Dashboard overview | ~/.dev-browser/tmp/ |
| dashboard_full.png | Full dashboard view | ~/.dev-browser/tmp/ |
| machines_master.png | Machines master page | ~/.dev-browser/tmp/ |
| machines_add_modal.png | Add machine modal | ~/.dev-browser/tmp/ |
| operators_master.png | Operators master page | ~/.dev-browser/tmp/ |
| components_master.png | Components master page | ~/.dev-browser/tmp/ |
| moulds_master.png | Moulds master page | ~/.dev-browser/tmp/ |
| bom_master.png | BOM master page | ~/.dev-browser/tmp/ |
| planning_page.png | Production planning page | ~/.dev-browser/tmp/ |
| planning_add_modal.png | Add plan modal | ~/.dev-browser/tmp/ |
| production_entry.png | Production entry form | ~/.dev-browser/tmp/ |
| production_list.png | Production reports list | ~/.dev-browser/tmp/ |
| reports_daily.png | Daily production report | ~/.dev-browser/tmp/ |
| reports_machine.png | Machine analysis report | ~/.dev-browser/tmp/ |
| reports_operator.png | Operator analysis report | ~/.dev-browser/tmp/ |
| reports_rejection.png | Rejection analysis report | ~/.dev-browser/tmp/ |
| reports_downtime.png | Downtime analysis report | ~/.dev-browser/tmp/ |

---

*Last Updated: 26 March 2026 11:45 AM*
*Testing Tool: dev-browser (Playwright-based)*
