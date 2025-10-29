# Task: Enable User Reading of IoT Device Endpoint Data

## Overview
Add real-time IoT data display in UserDashboard.jsx by fetching from /pzem endpoint and showing readings for user's devices.

## Steps to Complete

### 1. Add iotData state to UserDashboard.jsx
   - Initialize useState for iotData.

### 2. Implement polling for /pzem endpoint
   - Add useEffect with setInterval to fetch data every 5 seconds.

### 3. Update appliance display for real-time readings
   - Check if iotData.device_id matches device.id and display voltage, current, power, etc.

### 4. Handle edge cases
   - Show loading state, no data, or when device doesn't match.

## Progress
- [x] Step 1: Add iotData state
- [x] Step 2: Implement polling
- [x] Step 3: Update appliance display
- [x] Step 4: Handle edge cases

## Notes
- Fetch from http://localhost:3000/pzem
- Display real-time metrics alongside static usage.
