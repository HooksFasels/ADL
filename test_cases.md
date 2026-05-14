# Transit Admin Dashboard - Test Case Document

| TC NO. | SUMMARY | DEPENDENCY | PRE - CONDITION | POST - CONDITION | EXECUTION STEPS | EXPECTED OUTPUT | ACTUAL OUTPUT |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC 1** | **List Existing Routes** | API Server, NeonDB | Existing routes in `Route` table | Dashboard shows list | 1. Login as Transit Admin<br>2. Navigate to 'Routes' tab | Table should populate with code, name, and city of existing routes. | |
| **TC 2** | **Create New Route** | API Server, NeonDB | Logged in as Transit Admin | New route record in DB | 1. Enter Code, Name, City in 'New Route' form<br>2. Click 'Create Route' | 'Route created' message appears; list refreshes to show new route. | |
| **TC 3** | **List Existing Drivers** | API Server, NeonDB | Existing drivers in `DriverProfile` table | Dashboard shows driver list | 1. Navigate to 'Drivers' tab | Table should show driver names and their assigned license numbers. | |
| **TC 4** | **Kafka Health Check (OFF)** | API Server, Docker | Kafka container is STOPPED | Kafka status shows 'DOWN' | 1. Navigate to Admin Dashboard<br>2. Observe 'System Health' section | Kafka service should display a red 'DOWN' status. | |
| **TC 5** | **Kafka Health Check (ON)** | API Server, Docker | Kafka container is RUNNING | Kafka status shows 'UP' | 1. Start Kafka container<br>2. Refresh Admin Dashboard | Kafka service should display a green 'UP' status. | |
| **TC 6** | **Database Health Check** | API Server, NeonDB | API Server running | DB status shows 'UP' | 1. Observe 'System Health' section | Database service should display a green 'UP' status. | |
| **TC 7** | **API Timeout Handling** | Frontend Config | Database is in 'Cold Start' | Data loads successfully | 1. Open dashboard after long inactivity | Data should load within 10 seconds without 'Request Timeout' error. | |
| **TC 8** | **Route Name Validation** | Prisma Schema | Route table updated with `name` column | No 500 errors on fetch | 1. Fetch routes via API or UI | API returns 200 OK; 'name' field is present in the JSON response. | |
| **TC 9** | **User Authentication** | Auth Service | Valid credentials (transitadmin/transit123) | Redirect to /transit-admin | 1. Enter credentials on Login page<br>2. Click Login | User is redirected to the Transit Admin Dashboard successfully. | |
