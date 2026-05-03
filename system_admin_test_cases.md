# System Admin Dashboard - Test Case Document

| TC NO. | SUMMARY | DEPENDENCY | PRE - CONDITION | POST - CONDITION | EXECUTION STEPS | EXPECTED OUTPUT | ACTUAL OUTPUT |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC 1** | **Display Total Drivers Count** | API Server, NeonDB | Drivers exist in Database | Count is displayed on dashboard | 1. Login as System Admin<br>2. Observe the 'Total Drivers' card | The count should accurately reflect the total number of records in the `DriverProfile` table. | |
| **TC 2** | **Display Total Routes Count** | API Server, NeonDB | Routes exist in Database | Count is displayed on dashboard | 1. Observe the 'Total Routes' card | The count should accurately reflect the total number of records in the `Route` table. | |
| **TC 3** | **Display Total Vehicles Count** | API Server, NeonDB | Vehicles exist in Database | Count is displayed on dashboard | 1. Observe the 'Total Vehicles' card | The count should accurately reflect the total number of records in the `Vehicle` table. | |
| **TC 4** | **Live Data Polling** | Frontend Logic | Admin Dashboard is open | Counts update automatically | 1. Add a new route in Prisma Studio or Transit Admin UI<br>2. Wait 5-10 seconds | The 'Total Routes' count should increment automatically without a manual page refresh. | |
| **TC 5** | **API Server Health Status** | API Server | Server is running | Status shows 'UP' | 1. Observe 'System Health' -> 'API Server' | Should display a green 'UP' badge. | |
| **TC 6** | **Database Health Status** | API Server, NeonDB | DB is reachable | Status shows 'UP' | 1. Observe 'System Health' -> 'Database' | Should display a green 'UP' badge. | |
| **TC 7** | **Redis Health Status** | API Server, Redis Docker | Redis container is RUNNING | Status shows 'UP' | 1. Observe 'System Health' -> 'Redis' | Should display a green 'UP' badge. | |
| **TC 8** | **Kafka Health Status** | API Server, Kafka Docker | Kafka container is STOPPED | Status shows 'DOWN' | 1. Stop Kafka container<br>2. Observe 'System Health' -> 'Kafka' | Should display a red 'DOWN' badge. | |
| **TC 9** | **System Admin Logout** | Auth Store | Logged in as System Admin | Redirect to Login page | 1. Click the 'Logout' button | User should be redirected to the login screen and auth session cleared. | |
