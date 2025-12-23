# How to Identify Which Project Has Test Data

## Method 1: Check Migration Output (Recommended - Easiest!)

After running `create_comprehensive_test_data.sql` in Supabase SQL Editor:

1. Look at the output/notices section
2. Find the section that shows:
   ```
   📋 PROJECT TO USE FOR TESTING:
      Name: [Project Name]
      ID: [project-id]
   ```
3. **Use the Project Name** shown - this is the project that has test data!
4. No need to copy IDs - just use the project name in the application

**Example output:**
```
NOTICE: ========================================
NOTICE: ✅ Test data created successfully!
NOTICE: ========================================
NOTICE: 
NOTICE: 🎯 PROJECT TO USE FOR TESTING:
NOTICE:    ════════════════════════════════════
NOTICE:    Project Name: Website Redesign
NOTICE:    Project ID: 5e15eb4f-11fd-4bb2-a4cc-e95e9ea2543a
NOTICE:    ════════════════════════════════════
NOTICE: 
NOTICE: 🚀 NEXT STEPS:
NOTICE:    1. Go to Projects in your application
NOTICE:    2. Select project: "Website Redesign"
NOTICE:    3. Follow the testing guide: TESTING_GUIDE_PHASE3.md
```

**Simply look for "🎯 PROJECT TO USE FOR TESTING" and use the Project Name shown there!**

**Simply look for "✅ PROJECT TO USE FOR TESTING" and use the Project Name shown there!**

## Method 2: Check in Application

1. Navigate to **Projects** in the application
2. Look through your projects
3. The project with test data will have:
   - **Epics visible** when you click "View Epics":
     - "Customer Self-Service Portal"
     - "Order Management System"
   - **Sprints visible** when you click "View Sprints":
     - "Sprint 1 - Foundation" (Completed)
     - "Sprint 2 - Core Features" (Active)
     - "Sprint 3 - Advanced Features" (Planning)

## Method 3: Check Database Directly

Run this query in Supabase SQL Editor:

```sql
-- Find projects with test data (have epics or sprints)
SELECT DISTINCT p.id, p.name, p.status
FROM projects p
WHERE p.id IN (
  SELECT DISTINCT project_id FROM work_items WHERE type = 'Epic'
  UNION
  SELECT DISTINCT project_id FROM sprints
)
AND p.status NOT IN ('Cancelled', 'Completed')
ORDER BY p.name;
```

This will show you which active projects have Epics or Sprints (indicating test data).

## Method 4: Check Project Dashboard

1. Go to **Projects** → Select any active project
2. On the Project Dashboard, check the **Work Items** section
3. Click **"View Epics"**
4. If you see:
   - "Customer Self-Service Portal"
   - "Order Management System"
   
   Then this is the project with test data!

## What If I Have Multiple Projects?

The migration automatically selects the **first active project** (status not 'Cancelled' or 'Completed') based on database order.

**If you want test data in a specific project:**

1. Temporarily set other projects to 'Cancelled' status
2. Run the migration
3. Change the other projects back to their original status

**Or modify the migration** to target a specific project:

```sql
-- In create_comprehensive_test_data.sql, replace:
SELECT id INTO v_project_id
FROM projects
WHERE status NOT IN ('Cancelled', 'Completed')
LIMIT 1;

-- With:
SELECT id INTO v_project_id
FROM projects
WHERE id = 'YOUR-PROJECT-ID-HERE'::UUID;
```

## Quick Verification

Once you've selected a project, verify it has test data:

✅ **Epics List** shows 2 epics  
✅ **Features List** shows 3 features  
✅ **Sprints List** shows 3 sprints  
✅ **Sprint Detail** shows work items in backlog  
✅ **Sprint Board** is accessible for active sprint  

If you don't see these, you're looking at the wrong project!

