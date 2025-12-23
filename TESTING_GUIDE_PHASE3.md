# Phase 3 Testing Guide - Project Management Features

This guide will help you test all the Phase 3 functionalities we've implemented. Follow the steps in order to explore the complete Agile/PRINCE2 project management system.

## Prerequisites

1. **Run the database migrations:**
   ```sql
   -- Make sure these migrations are applied:
   - create_agile_prince2_tables.sql
   - create_agile_prince2_views.sql
   - create_sprint_retrospectives.sql
   - create_comprehensive_test_data.sql (NEW - run this to populate test data)
   ```

2. **Identify which project has test data:**
   - After running `create_comprehensive_test_data.sql`, check the Supabase SQL Editor output
   - Look for: `NOTICE: Using project ID: [your-project-id]`
   - This is the project that received the test data
   - **Note:** The migration uses the first active project (status not 'Cancelled' or 'Completed')

3. **Access the application** at your local development URL (typically `http://localhost:5173`)

---

## Test Flow Overview

1. **Project Dashboard** → Navigate to work items
2. **Work Item Hierarchy** → Test Epic → Feature → User Story → Task navigation
3. **Sprint Management** → Create and manage sprints
4. **Sprint Board** → Kanban board with drag-and-drop
5. **Sprint Metrics** → Burndown and Velocity charts
6. **Sprint Retrospectives** → Capture lessons learned

---

## Step 1: Access Project Dashboard

### ⚠️ Important: Which Project to Select?

The test data migration automatically uses the **first active project** (status not 'Cancelled' or 'Completed') in your database. 

**To identify the correct project:**

**Option A: Check Migration Output (Easiest!)**
1. After running `create_comprehensive_test_data.sql` in Supabase SQL Editor
2. Look at the output/notices section
3. Find the section: `🎯 PROJECT TO USE FOR TESTING:`
4. You'll see:
   ```
   Project Name: [Your Project Name]
   Project ID: [project-id]
   ```
5. **Use the Project Name** shown - this is what you should select in the application!
6. The output also includes next steps with the exact project name

**Option B: Check in Application**
1. Go to **Projects** → Click through your projects
2. Click **"View Epics"** for each project
3. The project with test data will show:
   - "Customer Self-Service Portal"
   - "Order Management System"
4. Or click **"View Sprints"** - should show 3 sprints

**Option C: Use SQL Query**
Run this in Supabase SQL Editor:
```sql
SELECT DISTINCT p.id, p.name, p.status
FROM projects p
WHERE p.id IN (
  SELECT DISTINCT project_id FROM work_items WHERE type = 'Epic'
  UNION
  SELECT DISTINCT project_id FROM sprints
)
AND p.status NOT IN ('Cancelled', 'Completed');
```

**Still not sure?** See `HOW_TO_IDENTIFY_TEST_PROJECT.md` for detailed instructions.

### Test Steps:
1. Navigate to **Projects** from the main menu
2. Click on the project that has test data (see identification tips above)
3. You should see the **Project Dashboard** with:
   - Project Summary information
   - **Work Items** section with buttons:
     - View Epics
     - View Features
     - View User Stories
     - View Tasks
     - View Sprints

### Expected Results:
- All navigation buttons are visible
- Project information displays correctly
- Quick stats show completion percentages

---

## Step 2: Test Epic Management

### Test Steps:
1. Click **"View Epics"** button on Project Dashboard
2. You should see:
   - **Epic 1: Customer Self-Service Portal** (In Progress)
   - **Epic 2: Order Management System** (In Progress)

3. **Test Epic List Features:**
   - Use the search box to filter epics
   - Filter by status (Backlog, ToDo, InProgress, etc.)
   - Click on an Epic title to view details

4. **Test Epic Detail:**
   - Click on **"Customer Self-Service Portal"**
   - You should see:
     - Epic information (status, priority, progress)
     - List of child Features
     - "Add Feature" button

5. **Test CRUD Operations:**
   - Click **"Add Feature"** to create a new feature
   - Fill in the form and save
   - Edit an existing feature
   - Delete a feature (confirm deletion)

### Expected Results:
- Epic list displays with progress bars
- Epic detail shows child features
- CRUD operations work correctly
- Progress percentages calculate correctly

---

## Step 3: Test Feature Management

### Test Steps:
1. From Epic Detail, click on a Feature (or go to **"View Features"** from dashboard)
2. You should see:
   - **Feature 1.1: User Registration & Authentication** (Done)
   - **Feature 1.2: User Dashboard** (In Progress)
   - **Feature 2.1: Order Placement** (ToDo)

3. **Test Feature List:**
   - Search for features
   - Filter by status
   - View User Stories count for each feature

4. **Test Feature Detail:**
   - Click on **"User Registration & Authentication"**
   - You should see:
     - Feature information
     - Acceptance criteria
     - List of child User Stories
     - Progress metrics

5. **Test Feature CRUD:**
   - Add a new User Story to the feature
   - Edit an existing User Story
   - Navigate to User Story detail

### Expected Results:
- Features show correct parent-child relationships
- User Stories count displays correctly
- Progress bars reflect completion status

---

## Step 4: Test User Story Management

### Test Steps:
1. From Feature Detail, click on a User Story (or go to **"View User Stories"** from dashboard)
2. You should see User Stories like:
   - **"As a new user, I want to register with my email and password"** (Done)
   - **"As a new user, I want to verify my email address"** (In Progress)
   - **"As a user, I want to see my account overview on the dashboard"** (In Progress)

3. **Test User Story List:**
   - Filter by status
   - Search functionality
   - View Tasks count

4. **Test User Story Detail:**
   - Click on a User Story
   - View acceptance criteria
   - See child Tasks
   - Check assignee and sprint assignment

5. **Test User Story CRUD:**
   - Add a new Task
   - Edit Task details
   - Assign to sprint
   - Assign to team member

### Expected Results:
- User Stories display with acceptance criteria
- Tasks are properly linked
- Sprint assignment works
- Assignee information shows correctly

---

## Step 5: Test Task Management

### Test Steps:
1. From User Story Detail, click on a Task (or go to **"View Tasks"** from dashboard)
2. You should see Tasks like:
   - **"Design registration form UI"** (Done)
   - **"Implement form validation logic"** (Done)
   - **"Create dashboard data API endpoint"** (In Progress)

3. **Test Task List:**
   - Filter by status
   - Search tasks
   - View effort estimates (in hours)

4. **Test Task Detail:**
   - Click on a Task
   - View task description
   - Check assignee
   - See sprint assignment
   - View sub-tasks (if any)

5. **Test Task CRUD:**
   - Create a new Task
   - Edit task status
   - Change assignee
   - Add sub-tasks

### Expected Results:
- Tasks show effort in hours
- Assignee information is correct
- Sprint assignment displays
- Status updates work

---

## Step 6: Test Sprint Management

### Test Steps:
1. Click **"View Sprints"** from Project Dashboard
2. You should see three sprints:
   - **Sprint 1 - Foundation** (Completed)
   - **Sprint 2 - Core Features** (Active)
   - **Sprint 3 - Advanced Features** (Planning)

3. **Test Sprint List:**
   - Search sprints
   - Filter by status
   - View sprint metrics (work items, progress, velocity)
   - See days remaining for active sprints

4. **Test Sprint Detail:**
   - Click on **"Sprint 2 - Core Features"** (Active Sprint)
   - You should see:
     - Sprint information (dates, goal, velocity)
     - Burndown chart
     - Sprint backlog (work items assigned)
     - Links to Board and Retrospective

5. **Test Sprint CRUD:**
   - Click **"Create Sprint"** to add a new sprint
   - Fill in: name, goal, dates, planned velocity
   - Edit an existing sprint
   - Delete a sprint (unassigns work items)

6. **Test Sprint Backlog:**
   - Click **"Add Work Item"** in Sprint Detail
   - Select User Stories or Tasks to add
   - Remove items from sprint backlog
   - Verify items appear in the backlog table

### Expected Results:
- Sprint list shows all sprints with correct status
- Sprint detail displays complete information
- Backlog management works correctly
- Burndown chart renders (if sprint has work items)

---

## Step 7: Test Sprint Board (Kanban)

### Test Steps:
1. From Sprint Detail, click **"View Board"** (only available for Active sprints)
2. You should see a Kanban board with 5 columns:
   - **Backlog**
   - **To Do**
   - **In Progress**
   - **In Review**
   - **Done**

3. **Test Drag-and-Drop:**
   - Drag a work item from one column to another
   - Item status should update automatically
   - Refresh the page to verify status persisted

4. **Test Board Features:**
   - View quick stats at the top
   - See burndown chart below stats
   - Click on work items to navigate to detail pages
   - Check work item type badges (US = User Story, T = Task)

### Expected Results:
- Kanban board displays correctly
- Drag-and-drop updates work item status
- Quick stats calculate correctly
- Navigation to work items works

---

## Step 8: Test Sprint Burndown Chart

### Test Steps:
1. From Sprint Detail page, view the **Sprint Burndown** chart
2. The chart should show:
   - **Ideal Burndown** line (dashed gray line)
   - **Actual Remaining** line (blue line)
   - Daily data points

3. **Test Chart Interaction:**
   - Hover over data points to see tooltips
   - Verify chart shows correct date range
   - Check that completed work items affect the burndown

### Expected Results:
- Chart renders correctly
- Ideal and actual lines are visible
- Tooltips show correct data
- Chart updates when work items are completed

---

## Step 9: Test Sprint Velocity

### Test Steps:
1. From Sprint Detail, click **"View Velocity Trends"** button
2. You should see:
   - **Statistics Cards:**
     - Total Sprints
     - Avg Planned Velocity
     - Avg Actual Velocity
     - Rolling Avg (3 sprints)
   
   - **Velocity Trend Chart:**
     - Bar chart showing Planned vs Actual per sprint
     - Line chart showing rolling average
   
   - **Velocity Details Table:**
     - Each sprint with planned, actual, variance
     - Rolling average calculations

3. **Test Velocity Features:**
   - Verify calculations are correct
   - Check variance shows positive/negative correctly
   - Confirm rolling average is calculated properly

### Expected Results:
- Statistics display correctly
- Chart shows velocity trends
- Table provides detailed breakdown
- Calculations are accurate

---

## Step 10: Test Sprint Retrospectives

### Test Steps:
1. From Sprint Detail, click **"Retrospective"** button
2. For **Sprint 1 (Completed)**, you should see:
   - Existing retrospective data
   - What Went Well section
   - What Could Be Improved section
   - Action Items list
   - Team Sentiment badge
   - Sprint Rating (stars)

3. **Test Retrospective CRUD:**
   - Click **"Create Retrospective"** for Sprint 2 or 3
   - Fill in:
     - What Went Well
     - What Could Be Improved
     - Team Sentiment (dropdown)
     - Sprint Rating (1-5)
     - Action Items (add multiple)
     - Additional Notes
   - Save the retrospective
   - Edit the retrospective
   - Delete the retrospective

4. **Test Action Items:**
   - Add action items with:
     - Description
     - Owner (select from resources)
     - Due date
     - Status (Pending, In Progress, Completed)
   - Remove action items
   - Verify action items display correctly

### Expected Results:
- Retrospective form works correctly
- All fields save properly
- Action items can be added/removed
- Team sentiment and rating display correctly
- Retrospective is linked to correct sprint

---

## Step 11: Test Work Item Hierarchy Navigation

### Test Steps:
1. Start from **Project Dashboard**
2. Navigate through the hierarchy:
   - Dashboard → Epics → Features → User Stories → Tasks
3. Use breadcrumbs and "Back" buttons to navigate
4. Test that parent-child relationships are maintained
5. Verify progress rolls up correctly:
   - Task completion affects User Story progress
   - User Story completion affects Feature progress
   - Feature completion affects Epic progress

### Expected Results:
- Navigation flows smoothly
- Breadcrumbs work correctly
- Progress percentages roll up accurately
- Parent-child relationships are clear

---

## Step 12: Test Search and Filtering

### Test Steps:
1. Test search functionality in:
   - Epic List
   - Feature List
   - User Story List
   - Task List
   - Sprint List

2. Test status filtering in all lists
3. Verify search works on:
   - Titles
   - Descriptions
   - Other relevant fields

### Expected Results:
- Search returns correct results
- Filters work as expected
- Combined search + filter works
- Results update in real-time

---

## Step 13: Test Progress Tracking

### Test Steps:
1. Navigate through different work items
2. Verify progress bars show correct percentages
3. Check that:
   - Completed items show 100%
   - In-progress items show partial completion
   - Backlog items show 0%
4. Update work item statuses and verify progress updates

### Expected Results:
- Progress bars are accurate
- Percentages calculate correctly
- Progress updates when status changes
- Rollup progress works for parent items

---

## Step 14: Test Sprint Assignment

### Test Steps:
1. Create or edit a User Story or Task
2. Assign it to a sprint from the dropdown
3. Verify it appears in:
   - Sprint backlog
   - Sprint board (if sprint is active)
   - Work item detail page
4. Remove from sprint and verify it disappears

### Expected Results:
- Sprint assignment works correctly
- Work items appear in sprint backlog
- Sprint board shows assigned items
- Removal from sprint works

---

## Step 15: Test Assignee Management

### Test Steps:
1. Edit a User Story or Task
2. Assign to a team member (resource)
3. Verify assignee appears:
   - In work item detail
   - In work item lists
   - In sprint board
4. Change assignee and verify update

### Expected Results:
- Assignee selection works
- Assignee name displays correctly
- Changes persist after save
- Unassigned items show "Unassigned"

---

## Common Issues and Troubleshooting

### Issue: No data appears
**Solution:** Make sure you've run the `create_comprehensive_test_data.sql` migration

### Issue: Sprint board not showing
**Solution:** Sprint board only appears for sprints with status "Active"

### Issue: Burndown chart is empty
**Solution:** Sprint needs to have work items assigned and be Active or Completed

### Issue: Velocity chart shows no data
**Solution:** Need at least one completed sprint with work items

### Issue: Cannot create retrospective
**Solution:** Make sure `sprint_retrospectives` table exists (run migration)

---

## Test Data Summary

After running the test data migration, you should have:

- **2 Epics:**
  - Customer Self-Service Portal
  - Order Management System

- **3 Features:**
  - User Registration & Authentication (Done)
  - User Dashboard (In Progress)
  - Order Placement (ToDo)

- **4 User Stories:**
  - Registration form (Done)
  - Email verification (In Progress)
  - Dashboard overview (In Progress)
  - Add to cart (Backlog)

- **3 Tasks:**
  - Design registration form UI (Done)
  - Implement form validation (Done)
  - Create dashboard API (In Progress)

- **3 Sprints:**
  - Sprint 1 - Foundation (Completed)
  - Sprint 2 - Core Features (Active)
  - Sprint 3 - Advanced Features (Planning)

- **1 Retrospective:**
  - For Sprint 1 (Completed)

- **2 PRINCE2 Stages:**
  - Initiation (Complete)
  - Delivery (In Progress)

---

## Success Criteria

✅ All navigation links work  
✅ CRUD operations function correctly  
✅ Progress tracking is accurate  
✅ Sprint management works end-to-end  
✅ Kanban board drag-and-drop works  
✅ Charts render correctly  
✅ Retrospectives can be created and managed  
✅ Search and filtering work  
✅ Hierarchy navigation is smooth  
✅ Data persists correctly  

---

## Next Steps After Testing

Once you've verified all functionality:

1. **Create your own test data** for your specific use cases
2. **Customize workflows** to match your team's process
3. **Set up PRINCE2 stages** for your projects
4. **Configure Definition of Done** (when implemented)
5. **Plan your first real sprint** using the system

---

## Support

If you encounter any issues during testing:
1. Check browser console for errors
2. Verify database migrations are applied
3. Check Supabase logs for database errors
4. Ensure test data migration ran successfully

Happy Testing! 🚀

