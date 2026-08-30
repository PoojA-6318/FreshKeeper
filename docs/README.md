# FreshKeeper — Documentation

This folder stores all project documentation — design artefacts, diagrams, requirements, and planning materials for FreshKeeper.

## Folder Structure

```text
docs/
├── diagrams/            # UML and system design diagrams
│   ├── er_diagram.png           # Entity-Relationship Diagram
│   ├── use_case_diagram.png     # Use Case Diagram
│   ├── class_diagram.png        # Class Diagram
│   ├── dfd_level0.png           # Data Flow Diagram — Level 0 (Context)
│   ├── dfd_level1.png           # Data Flow Diagram — Level 1
│   ├── sequence_diagrams/       # Sequence diagrams per feature
│   │   ├── login.png
│   │   ├── add_food.png
│   │   ├── expiry_check.png
│   │   └── notification.png
│   └── activity_diagrams/       # Activity diagrams per feature
│
├── requirements/
│   ├── SRS.pdf                  # Software Requirements Specification
│   └── PRD.md                   # Product Requirements Document
│
├── planning/
│   ├── WBS.pdf                  # Work Breakdown Structure
│   └── increment_plan.md        # Increment-wise feature plan
│
└── README.md                    # This file
```

## What's in Here

| Folder         | Contents                                                         |
|----------------|------------------------------------------------------------------|
| diagrams/      | ER diagram, use case, DFD, class, activity, sequence diagrams    |
| requirements/  | SRS document and PRD                                             |
| planning/      | WBS and increment planning notes                                 |

> All implementation should stay consistent with the diagrams and SRS stored in this folder.
