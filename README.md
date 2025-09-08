# Early Prediction of Carbapenemase-Producing Enterobacterales Colonization at ICU Admission Using Machine Learning

## Overview
- This repository contains code and materials for a prediction model that estimates the risk of CPE colonization at the time of ICU admission using routinely available clinical data. The study was a single-center, retrospective cohort (Jan 2022–Dec 2023, South Korea) reported with reference to TRIPOD-AI guidelines. A web tool is available for point-of-care use. (www.cpepredictor.com)
- Population: 4,915 ICU admissions; 453 (9.2%) CPE-positive on rectal swab within 48 h
- Outcome: CPE colonization (binary) at ICU admission
- Best model: Logistic regression (threshold 0.45) with high sensitivity 0.73 and NPV 0.96; ROC-AUC 0.77, PR-AUC 0.36
- Use case: Rule-out aid to help prioritize isolation resources before culture results are available

## Datasets
- Setting: 842-bed tertiary referral hospital (Anyang, South Korea)
- Period: January 2022 – December 2023
- Inclusion: First ICU admission per adult patient with rectal surveillance culture within 48 h
- Split: Chronological 80:20 train:test
- Candidate predictors: 42 EMR variables available at admission; engineered composite scores for antibiotics, indwelling devices, and comorbidities; no missing data
  

## Machine Learning Models Used

Ten classifiers were compared (default hyperparameters; stratified 5-fold CV on training set):
- Logistic Regression
- Decision Tree
- Random Forest
- Extra Trees
- Gradient Boosting
- AdaBoost
- Support Vector Machine (RBF)
- XGBoost
- LightGBM
- Voting Ensemble


## Final Model Selection & Thresholding

The project prioritized sensitivity for infection-control utility. Logistic regression offered the most balanced trade-off. On the held-out test set:
- Threshold 0.50: Sensitivity 0.63, Specificity 0.77, ROC-AUC 0.77, PR-AUC 0.36
- Threshold 0.45 (selected): Sensitivity 0.73, NPV 0.96 (PPV ~0.19)
- Threshold 0.40: Sensitivity 0.77
These figures support use as a rule-out tool; positive predictions warrant clinical review and/or rapid molecular screening rather than automatic isolation.

## Web Application
- A public demo is available: www.cpepredictor.com.
- Inputs: 14 admission-time variables
- Output: Estimated CPE colonization risk with a recommended decision threshold (0.45 in the study)

## Contact
For inquiries, contact Hyeonji Seo (lollipop0831@gmail.com)
