# 🏷️ Simplified Issue Labeling System

## Overview

**PROBLEM SOLVED**: The previous labeling system had too much overlap and confusion. This new system is **simple, clear, and consistent**.

## ✅ **SIMPLIFIED LABEL SYSTEM**

### **RULE: Maximum 3 labels per issue**
- **1 TYPE** (required): What kind of issue is this?
- **1 PRIORITY** (required): How urgent is this?
- **1 AREA** (optional): Where in the app does this relate to?

---

## **📋 Available Labels**

### **TYPE** (Required - pick exactly one)
- `bug` 🐛 - Something is broken
- `feature` ✨ - New functionality
- `feedback` 💬 - User feedback
- `testing` 🧪 - Test coverage

### **PRIORITY** (Required - pick exactly one)
- `urgent` 🚨 - Fix immediately
- `normal` ⭐ - Standard priority
- `low` 💡 - When time permits

### **AREA** (Optional - pick one if relevant)
- `puzzles` 🧩 - Puzzle system
- `scoring` 🏆 - Points & levels
- `ui` 🎨 - User interface
- `performance` ⚡ - Speed & memory

---

## **🔄 Automated Labeling**

Scripts automatically apply labels based on content:

| **If issue contains...** | **Gets labels...** |
|---|---|
| "crash" or "broken" | `bug` + `urgent` |
| "slow" | `bug` + `normal` + `performance` |
| "puzzle" | `puzzles` |
| "score" | `scoring` |
| "interface" | `ui` |
| "suggest" or "feature" | `feature` + `normal` |

---

## **📊 Script Usage**

### **Test Coverage Issues**
```bash
# Labels: testing + normal
npm run test-coverage-analysis
```

### **User Feedback**
```bash
# Labels: feedback + (varies by content)
npm run feedback-sync
```

### **Issue Triage**
```bash
# Automatically labels unlabeled issues
npm run issue-triage
```

---

## **✅ No More Confusion!**

- **Before**: 50+ overlapping labels
- **After**: 11 clear labels with simple rules
- **Result**: Every issue gets consistent, meaningful labels

Each workflow uses the **same master label system** - no more unique labels per script!