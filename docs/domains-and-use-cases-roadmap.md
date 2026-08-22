# Domains and Use Cases Roadmap

This document lists the domains and use cases that are interesting for a
SIGAA-like academic system.

## Phase Backlog

The roadmap below is organized so that Phase 1 establishes identity and access,
while Phase 2 focuses on the academic core.

## Phase 1. Foundation

### Main Goal

- Establish identity, authentication, and account lifecycle.

### Core Domains

- `users-management`
- `authentication`
- `authorization`
- `sessions`

### Core Use Cases

- Create user
- Update user
- Disable user
- Restore user
- Change password
- Recover password
- Login
- Refresh token
- Logout
- Create role
- Update role
- Create policy
- Update policy
- Block account
- Unblock account

## Phase 2. Academic Core

### Main Goal

- Model the operational heart of the academic system.

### Domains

- `academic-management`
- `curriculum-management`
- `class-management`
- `enrollment-management`

### Priority Use Cases

- Create student profile
- Create professor profile
- Create staff profile
- Update profiles
- Link student to course
- Link professor to department
- Create academic period
- Create class offering
- Enroll student
- Unenroll student
- Assign professor to class
- Mark attendance
- Mark attendance batch
- Create activity
- Update activity
- Publish activity
- Submit activity
- Attach file to activity
- Grade activity
- Close class offering
- Close academic period

### Supporting Use Cases

- Create subject
- Update subject
- Define prerequisites
- Link subject to course
- Build curriculum matrix
- Define workload
- Import curriculum matrix
- Create class schedule
- Update schedule
- Block room
- Reschedule class
- View calendar by class
- View calendar by professor
- View calendar by student
- Detect schedule conflicts
- Suggest free slots
- Mark presence
- Mark absence
- Justify absence
- Approve justification
- Correct attendance
- Close attendance sheet
- Import attendance in batch
- View attendance history

## Phase 3. Academic Expansion

### Main Goal

- Extend the academic core with courses, schedules, and operational support.

### Domains

- `courses-management`
- `subjects-management`
- `schedule-management`
- `periods-management`
- `room-booking`
- `attendance-management`

### Use Cases

- Create course
- Update course
- Archive course
- Create subject
- Update subject
- Define prerequisites
- Link subject to course
- Build curriculum matrix
- Define workload
- Import curriculum matrix
- Create class schedule
- Update schedule
- Block room
- Reschedule class
- View calendar by class
- View calendar by professor
- View calendar by student
- Detect schedule conflicts
- Suggest free slots
- Mark presence
- Mark absence
- Justify absence
- Approve justification
- Correct attendance
- Close attendance sheet
- Import attendance in batch
- View attendance history

## 6. Activities and Assessments

### Domains

- `activities-management`
- `assignments-management`
- `assessments-management`
- `submissions-management`
- `grades-management`

### Use Cases

- Create activity
- Update activity
- Attach file
- Remove attachment
- Publish activity
- Submit activity
- Edit submission before deadline
- Grade submission
- Assign feedback
- Reopen activity
- List submissions by activity

## 7. Files and Storage

### Domains

- `files-management`
- `media-management`
- `documents-management`

### Use Cases

- Generate upload URL
- Register uploaded file
- Link file to activity
- Remove file
- List files by entity
- Mark file as public or private
- Version file
- Expire file

## 8. Communication

### Domains

- `announcements-management`
- `messages-management`
- `notifications-management`
- `messaging`

### Use Cases

- Create announcement
- Update announcement
- Publish announcement
- Cancel announcement
- Send notification
- Mark notification as read
- Send internal message
- Reply in thread
- Attach file to announcement

## 9. Academic Records

### Domains

- `transcripts-management`
- `certificates-management`
- `history-management`
- `documents-management`

### Use Cases

- Generate transcript
- Calculate average
- Consolidate approval or failure
- Issue declaration
- Issue enrollment certificate
- Issue report card
- Generate certificate
- Validate document

## 10. Enrollment Lifecycle

### Domains

- `enrollment-management`
- `registration-management`

### Use Cases

- Create enrollment
- Renew enrollment
- Freeze enrollment
- Cancel enrollment
- Reactivate enrollment
- Validate requirements
- Approve enrollment
- Reject enrollment

## 11. People and Profiles

### Domains

- `student-management`
- `professor-management`
- `staff-management`
- `guardian-management`

### Use Cases

- Create profile
- Update profile
- View profile
- Link course or department
- Validate status
- Activate or deactivate relationship
- Attach personal documents

## 12. Organization

### Domains

- `campus-management`
- `department-management`
- `room-management`
- `building-management`

### Use Cases

- Create campus
- Create department
- Create building
- Create room
- Update room
- Disable room
- Check availability
- Associate course to campus

## 13. Academic Planning

### Domains

- `planning-management`
- `semester-planning`
- `teaching-assignment`

### Use Cases

- Plan semester
- Distribute faculty
- Define offered subjects
- Approve teaching plan
- Update teaching plan
- Publish schedule

## 14. Finance and Billing

### Domains

- `billing-management`
- `fees-management`
- `scholarship-management`

### Use Cases

- Generate charge
- Register payment
- Apply discount
- Grant scholarship
- Suspend access due to debt
- View statement

## 15. Support and Audit

### Domains

- `support-management`
- `audit-log`
- `incident-management`

### Use Cases

- Open ticket
- Add ticket comment
- Close ticket
- Record audit trail
- View user events
- Detect suspicious actions

## 16. Reporting and Analytics

### Domains

- `reports-management`
- `dashboard-management`
- `analytics`

### Use Cases

- Attendance report
- Performance report
- Dropout report
- Class report
- Faculty report
- KPI dashboard
- Export CSV or PDF

## 17. Integration

### Domains

- `integrations`
- `import-export`
- `sync-management`

### Use Cases

- Import students
- Import professors
- Import classes
- Export data
- Sync with external system
- Emit webhook
- Queue processing

## 18. Security and Compliance

### Domains

- `security-management`
- `consent-management`
- `privacy-management`

### Use Cases

- Register consent
- Revoke consent
- Mask sensitive data
- Export user data
- Delete data on request
- Record privacy audit

## Suggested Core Priority

If the goal is to stabilize the product quickly, a good order is:

1. `users-management`
2. `authentication`
3. `academic-management`
4. `courses-management`
5. `schedule-management`
6. `attendance-management`
7. `activities-management`
8. `submissions-management`
9. `grades-management`
10. `notifications-management`
11. `files-management`
12. `reports-management`

## Suggested Immediate Next Use Cases

- Create activity
- List activities by class
- Submit activity
- Grade submission
- Mark attendance
- View class calendar
- Enroll student
- Create class offering
- Assign professor to class
- Send announcement
