# Repository Structure

## Production Documentation (Root)

Essential documentation for deployment and operations:

- **README.md** - Platform overview with architecture diagrams
- **STARTUP_GUIDE.md** - Local development and deployment setup
- **STARTUP_SCRIPTS_SUMMARY.md** - Quick reference for startup scripts
- **ARCHITECTURE_FORTRESS_BLUEPRINT.md** - Complete fortress architecture specification
- **ARCHITECTURE_INDEX.md** - Architecture documentation index
- **ARCHITECTURE_TRANSACTION_FLOW.md** - Transaction flow through the system
- **FORTRESS_QUICK_REFERENCE.md** - Quick reference guide
- **PROJECT_COMPLETE.md** - Project completion summary
- **BUSINESS_ROI_ANALYSIS.md** - Financial projections and ROI
- **SCALING_STRATEGY.md** - Technical and operational scaling roadmap

## Development Files (.development/)

Hidden from production, organized by purpose:

### .development/task-tracking/
Task tracking and implementation records:
- PHASE*.md - Phase completion summaries
- TASK*.md - Individual task documentation
- IMPLEMENTATION_TASKS.md - Implementation checklist
- DEVELOPMENT_ROADMAP.md - Development roadmap
- ASSESSMENT_FINDINGS.md - Assessment results
- EXECUTION_SUMMARY.md - Execution summaries
- DEPLOYMENT_ISSUE*.md - Deployment issue tracking

### .development/deployment-logs/
Runtime logs and temporary files:
- *.log - Application logs
- Process ID files
- Temporary deployment artifacts

## Source Code

- **src/** - Backend Node.js source code
- **frontend/** - Next.js web application
- **jit-funding-service/** - Go microservice
- **k8s/** - Kubernetes manifests
- **docker-compose.yml** - Container orchestration

## Configuration

- **.env** - Environment variables (gitignored)
- **.env.required** - Required environment template
- **.gitignore** - Git ignore rules
- **package.json** - Node.js dependencies
- **tsconfig.json** - TypeScript configuration

## Key Features

✅ **Clean Repository**: Only production-ready code and documentation in root
✅ **Organized Development**: All task files in .development/ folder
✅ **Proper Gitignore**: Development files excluded from version control
✅ **Production Ready**: All necessary documentation for deployment

## Getting Started

1. **Read**: Start with README.md
2. **Setup**: Follow STARTUP_GUIDE.md
3. **Understand**: Review ARCHITECTURE_FORTRESS_BLUEPRINT.md
4. **Deploy**: Use docker-compose or start.sh

## For Developers

Development files are in `.development/` folder:
- Task tracking: `.development/task-tracking/`
- Logs: `.development/deployment-logs/`

These are gitignored and not part of production repository.

---

**Status**: ✅ Clean, organized, production-ready
