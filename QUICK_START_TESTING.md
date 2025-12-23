# Quick Start - Phase 3 Testing

> **⚠️ Important:** After running the test data migration, see `HOW_TO_IDENTIFY_TEST_PROJECT.md` to find which project has the test data!

## Step 1: Apply Database Migrations

Run these migrations in order in your Supabase SQL Editor:

1. ✅ `create_agile_prince2_tables.sql` (should already be applied)
2. ✅ `create_agile_prince2_views.sql` (should already be applied)
3. ✅ `create_sprint_retrospectives.sql` (NEW - creates retrospectives table)
4. ✅ `create_comprehensive_test_data.sql` (NEW - populates test data)

**⚠️ If you get a duplicate key error:**
- The migration is now idempotent and will skip if test data already exists
- If you want to recreate test data, first run `cleanup_test_data.sql` to remove existing test data
- Then re-run `create_comprehensive_test_data.sql`

### How to Apply Migrations:

**Option A: Via Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of each migration file
5. Click **Run** (or press Cmd/Ctrl + Enter)

**Option B: Via Supabase CLI** (if you have it set up)
```bash
supabase db push
```

## Step 2: Verify Test Data Was Created

After running `create_comprehensive_test_data.sql`, you should see output like:
```
NOTICE: ========================================
NOTICE: ✅ Test data created successfully!
NOTICE: ========================================
NOTICE: 
NOTICE: 🎯 PROJECT TO USE FOR TESTING:
NOTICE:    ════════════════════════════════════
NOTICE:    Project Name: [Your Project Name]
NOTICE:    Project ID: [your-project-id]
NOTICE:    ════════════════════════════════════
NOTICE: 
NOTICE: 🚀 NEXT STEPS:
NOTICE:    1. Go to Projects in your application
NOTICE:    2. Select project: "[Your Project Name]"
NOTICE:    3. Follow the testing guide: TESTING_GUIDE_PHASE3.md
```

**IMPORTANT:** Look for the "🎯 PROJECT TO USE FOR TESTING" section - this clearly shows the **Project Name** you should select in the application!

## Step 3: Access the Application

1. Start your development server (if not running):
   ```bash
   npm run dev
   ```

2. Open your browser to: `http://localhost:5173` (or your configured port)

3. Navigate to **Projects** from the main menu

4. **Select the project that has test data:**
   - **EASIEST:** Use the **Project Name** from Step 2 output (look for "🎯 PROJECT TO USE FOR TESTING")
   - The output clearly shows: `Project Name: [Your Project Name]`
   - OR look for a project that shows:
     - Epics: "Customer Self-Service Portal" and "Order Management System"
     - Sprints: "Sprint 1 - Foundation", "Sprint 2 - Core Features", "Sprint 3 - Advanced Features"
   - **Note:** The migration automatically uses the first active project (not Cancelled/Completed)

## Step 4: Follow the Testing Guide

Open `TESTING_GUIDE_PHASE3.md` and follow the step-by-step testing instructions.

## Quick Test Checklist

- [ ] Migrations applied successfully
- [ ] Test data created (check Supabase tables)
- [ ] Application loads without errors
- [ ] Can navigate to Project Dashboard
- [ ] Work Items section shows all buttons
- [ ] Can view Epics list
- [ ] Can view Features list
- [ ] Can view User Stories list
- [ ] Can view Tasks list
- [ ] Can view Sprints list
- [ ] Can access Sprint Board
- [ ] Can view Sprint Retrospective
- [ ] Can view Sprint Velocity

## Test Data Overview

The test data includes:

- **2 Epics** with different statuses
- **3 Features** (Done, In Progress, ToDo)
- **4 User Stories** with various statuses
- **3 Tasks** (some completed, some in progress)
- **3 Sprints** (1 Completed, 1 Active, 1 Planning)
- **1 Retrospective** for the completed sprint
- **2 PRINCE2 Stages** (Initiation complete, Delivery in progress)

All work items are properly linked in a hierarchy:
```
Epic 1: Customer Self-Service Portal
  └── Feature 1.1: User Registration & Authentication (Done)
      ├── User Story 1.1.1: Registration Form (Done)
      │   ├── Task: Design Registration Form UI (Done)
      │   └── Task: Implement Form Validation (Done)
      └── User Story 1.1.2: Email Verification (In Progress)
  └── Feature 1.2: User Dashboard (In Progress)
      └── User Story 1.2.1: Dashboard Overview (In Progress)
          └── Task: Create Dashboard API (In Progress)

Epic 2: Order Management System
  └── Feature 2.1: Order Placement (ToDo)
      └── User Story 2.1.1: Add to Cart (Backlog)
```

## Troubleshooting

### "No active projects found"
- Make sure you have at least one project in the `projects` table
- Project status should not be 'Cancelled' or 'Completed'

### "Table does not exist"
- Make sure you've run all the table creation migrations first
- Check the migration order

### "No data showing"
- Verify the test data migration ran successfully
- Check Supabase logs for errors
- Verify you're looking at the correct project

### "Sprint board not accessible"
- Sprint board only works for sprints with status "Active"
- Make sure Sprint 2 is set to "Active" status

## Next Steps

Once testing is complete:
1. Review the full testing guide: `TESTING_GUIDE_PHASE3.md`
2. Create your own test scenarios
3. Customize the system for your team's needs
4. Plan your first real sprint!

