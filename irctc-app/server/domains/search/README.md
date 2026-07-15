# Search Query Domain

This domain acts as a CQRS Read Model and API Gateway (Backend-For-Frontend) to aggregate data across the Network, Fleet, Inventory, and Booking domains.

## Responsibilities
- Receives search requests from the frontend.
- Resolves station UUIDs using the Network domain.
- Locates candidate trains and schedules using the Fleet domain.
- Aggregates the data into a unified DTO.

## Strict DDD Constraints
This domain is **READ ONLY**.
- It owns ZERO database tables.
- It executes ZERO write operations.
- It relies strictly on the repository methods exposed by existing domains.
- If a required capability (e.g., dynamic `train_run_id` lookup by date, or coach layouts) is missing from the underlying domain repositories, this domain explicitly returns a `501 Not Implemented` error rather than fabricating data or duplicating SQL.
