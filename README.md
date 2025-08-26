# Machine learning for early prediction of ICU colonization with carbapenemase-producing Enterobacterales: a SMOTE-enhanced approach

This study aims to predict 'CPE or not' by developing machine learning models for the isolation of patients who are suspected of infection.

This project presents interpretable machine learning models to predict colonization by carbapenemase-producing Enterobacterales (CPE) at the time of ICU admission. By using structured electronic medical record (EMR) data and applying SMOTE to address class imbalance, we aimed to support early infection control decisions in critical care settings.

## 🧠 Overview
- **Goal**: Predict whether an ICU-admitted patient is colonized with CPE using clinical and demographic data.
- **Approach**: Logistic regression and other machine learning algorithms trained on a 2022 ICU dataset, validated using 2023 data.
- **Key Tools**: SMOTE for imbalance correction, SHAP for model interpretability.

## 📊 Datasets
- **Training**: 1,992 ICU admissions (2022)  
  - CPE+: 220 (11%), CPE–: 1,772 (89%)
- **Validation**: 2,923 ICU admissions (2023)  
  - CPE+: 233 (8%), CPE–: 2,690 (92%)

## 🤖 Machine Learning Models Used

| Model Name              | Description                         |
|-------------------------|-------------------------------------|
| Logistic Regression     | Linear model for binary classification with L2 regularization |
| Decision Tree           | Tree-based model for interpretable splits |
| Random Forest           | Ensemble of decision trees using bagging |
| Extra Trees             | Ensemble method with randomized splits |
| XGBoost                 | Gradient boosting with regularization (fast and accurate) |
| LightGBM                | Fast gradient boosting using leaf-wise splits |
| Gradient Boosting       | Sequential ensemble of weak learners |
| AdaBoost                | Boosting algorithm combining weak learners iteratively |
| SVM (RBF)               | Support vector machine with radial basis function kernel |
| K-Nearest Neighbors     | Distance-based non-parametric classifier |



## 🔍 Key Findings
- **Best Model**: Logistic Regression with SMOTE
  - **Sensitivity**: 0.62
  - **PR-AUC**: 0.22
  - **ROC-AUC**: 0.71
- **Top Predictors**: Central venous catheter, nasogastric tube, prior antibiotics, long-term care admission.

## 📁 Repository Structure
- `outcome of code_1/`: Generated results including figures, tables, and supplementary material 1.
- `outcome of code_2/`: Generated results including supplementary material 2.
- `1. Overall_CPE_prediction_code/`: Jupyter notebook for data preprocessing, model training, evaluation, coefficients of logistic regression, and SHAP interpretation.
- `2. Supplemental_material_2_Generation/`: Comparing the baseline characteristics of the 2022 training cohort and the 2023 validation

## ✉️ Contact
For inquiries, contact Yong Kyun Kim (amoureuxyk@naver.com)
