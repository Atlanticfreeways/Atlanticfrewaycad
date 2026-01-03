#!/bin/bash

# ============================================
# Atlanticfrewaycard Task Files Cleanup Script
# ============================================
# This script helps manage development task files
# and verify they are properly excluded from git

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Atlanticfrewaycard Task Files Manager${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to display menu
show_menu() {
    echo -e "${YELLOW}Select an option:${NC}"
    echo "1. Check git status (verify task files excluded)"
    echo "2. List all task files"
    echo "3. Archive completed task files"
    echo "4. Verify .gitignore configuration"
    echo "5. Show production-ready files"
    echo "6. Clean up temporary files"
    echo "7. Exit"
    echo ""
}

# Function to check git status
check_git_status() {
    echo -e "${BLUE}Checking git status...${NC}\n"
    
    # Check if any task files are staged
    STAGED_TASK_FILES=$(git diff --cached --name-only | grep -E "(IMPLEMENTATION_TASKS|DEVELOPMENT_ROADMAP|PROJECT_OVERVIEW|WEEK1_CHECKLIST|TASK_|NEXT_TASK|CURRENT_STATUS)" || true)
    
    if [ -z "$STAGED_TASK_FILES" ]; then
        echo -e "${GREEN}✓ No task files staged for commit${NC}"
    else
        echo -e "${RED}✗ WARNING: Task files staged for commit:${NC}"
        echo "$STAGED_TASK_FILES"
    fi
    
    # Check if task files exist but are untracked
    UNTRACKED_TASK_FILES=$(git ls-files --others --exclude-standard | grep -E "(IMPLEMENTATION_TASKS|DEVELOPMENT_ROADMAP|PROJECT_OVERVIEW|WEEK1_CHECKLIST|TASK_|NEXT_TASK|CURRENT_STATUS)" || true)
    
    if [ -z "$UNTRACKED_TASK_FILES" ]; then
        echo -e "${GREEN}✓ No untracked task files${NC}"
    else
        echo -e "${YELLOW}⚠ Untracked task files (properly ignored):${NC}"
        echo "$UNTRACKED_TASK_FILES"
    fi
    
    echo ""
}

# Function to list all task files
list_task_files() {
    echo -e "${BLUE}Task Files in Repository:${NC}\n"
    
    echo -e "${YELLOW}Implementation Planning:${NC}"
    ls -lh IMPLEMENTATION_TASKS.md DEVELOPMENT_ROADMAP.md PROJECT_OVERVIEW.md PROJECT_SUMMARY.md TECHNICAL_ARCHITECTURE.md QUICK_START.md ASSESSMENT_FINDINGS.md 2>/dev/null || echo "  (some files not found)"
    
    echo -e "\n${YELLOW}Checklists & Tracking:${NC}"
    ls -lh WEEK1_CHECKLIST.md IMPLEMENTATION_CHECKLIST.md 2>/dev/null || echo "  (some files not found)"
    
    echo -e "\n${YELLOW}Temporary Files:${NC}"
    ls -lh Untitled-*.md fix-startup.sh 2>/dev/null || echo "  (no temporary files)"
    
    echo ""
}

# Function to archive completed task files
archive_task_files() {
    echo -e "${BLUE}Archiving completed task files...${NC}\n"
    
    ARCHIVE_DIR="task-archives/$(date +%Y-%m-%d)"
    mkdir -p "$ARCHIVE_DIR"
    
    # Archive task files
    for file in IMPLEMENTATION_TASKS.md DEVELOPMENT_ROADMAP.md PROJECT_OVERVIEW.md WEEK1_CHECKLIST.md; do
        if [ -f "$file" ]; then
            cp "$file" "$ARCHIVE_DIR/"
            echo -e "${GREEN}✓ Archived $file${NC}"
        fi
    done
    
    echo -e "\n${GREEN}Archive created at: $ARCHIVE_DIR${NC}"
    echo -e "${YELLOW}Note: Original files remain in repository${NC}\n"
}

# Function to verify .gitignore
verify_gitignore() {
    echo -e "${BLUE}Verifying .gitignore configuration...${NC}\n"
    
    TASK_FILES=(
        "IMPLEMENTATION_TASKS.md"
        "DEVELOPMENT_ROADMAP.md"
        "PROJECT_OVERVIEW.md"
        "WEEK1_CHECKLIST.md"
        "marqeta.txt"
        "schema.sql"
        "test_data.sql"
    )
    
    for file in "${TASK_FILES[@]}"; do
        if git check-ignore -q "$file" 2>/dev/null; then
            echo -e "${GREEN}✓ $file is properly ignored${NC}"
        else
            echo -e "${RED}✗ $file is NOT ignored${NC}"
        fi
    done
    
    echo ""
}

# Function to show production-ready files
show_production_files() {
    echo -e "${BLUE}Production-Ready Files (Safe to Commit):${NC}\n"
    
    echo -e "${YELLOW}Source Code:${NC}"
    find src -type f -name "*.js" | head -5
    echo "  ... and more"
    
    echo -e "\n${YELLOW}Tests:${NC}"
    find tests -type f -name "*.test.js" | head -5
    echo "  ... and more"
    
    echo -e "\n${YELLOW}Configuration:${NC}"
    ls -1 .env.example .eslintrc.js jest.config.js package.json 2>/dev/null || echo "  (some files not found)"
    
    echo -e "\n${YELLOW}Documentation:${NC}"
    ls -1 README.md docs/*.md 2>/dev/null || echo "  (some files not found)"
    
    echo ""
}

# Function to clean up temporary files
cleanup_temp_files() {
    echo -e "${BLUE}Cleaning up temporary files...${NC}\n"
    
    # Remove temporary markdown files
    TEMP_FILES=$(find . -maxdepth 1 -name "Untitled-*.md" -o -name "fix-startup.sh" 2>/dev/null)
    
    if [ -z "$TEMP_FILES" ]; then
        echo -e "${GREEN}✓ No temporary files to clean${NC}"
    else
        echo -e "${YELLOW}Found temporary files:${NC}"
        echo "$TEMP_FILES"
        echo ""
        read -p "Delete these files? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "$TEMP_FILES" | xargs rm -f
            echo -e "${GREEN}✓ Temporary files deleted${NC}"
        else
            echo -e "${YELLOW}Cleanup cancelled${NC}"
        fi
    fi
    
    echo ""
}

# Main loop
while true; do
    show_menu
    read -p "Enter your choice (1-7): " choice
    
    case $choice in
        1)
            check_git_status
            ;;
        2)
            list_task_files
            ;;
        3)
            archive_task_files
            ;;
        4)
            verify_gitignore
            ;;
        5)
            show_production_files
            ;;
        6)
            cleanup_temp_files
            ;;
        7)
            echo -e "${GREEN}Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option. Please try again.${NC}\n"
            ;;
    esac
done
