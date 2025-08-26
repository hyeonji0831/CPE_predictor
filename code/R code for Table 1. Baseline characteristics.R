# ===== Install necessary packages (run only once) =====
install.packages(c("rlang", "gt", "gtsummary", "readxl", "writexl", "officer"))

# ===== Load libraries =====
library(readxl)
library(dplyr)
library(gtsummary)
library(officer)
library(writexl)
library(gt)

# ===== Load Excel data =====
df_2022 <- read_excel("CPE_2022.xlsx")
df_2023 <- read_excel("CPE_2023.xlsx")

# ===== Combine datasets (use all patients) =====
df_all <- bind_rows(df_2022, df_2023)

# Ensure CPE is factor for grouping
df_all$CPE <- as.factor(df_all$CPE)

# ===== Create Table 1 using all patients =====
table1 <- df_all %>%
  select(
    CPE,
    Sex,
    Age,
    `Hospital days before ICU admission`,
    `Admission source`,
    `Previous hospitalization`,
    `Preexisting medical condition`,
    `Diabetes mellitus`,
    `Chronic renal disease`,
    `ESRD on renal replacement therapy`,
    `Liver cirrhosis`,
    `Chronic obstructive pulmonary disease`,
    `Cardiovascular disease`,
    `Solid cancer`,
    `Hematologic malignancy`,
    `Solid organ transplant`,
    `Cerebrovascular disease`,
    `Previous surgery within`,
    `Recent chemotherapy`,
    `Aortic disease`,
    `Immunosuppressant use`,
    `Steroid use`,
    `Indwelling device`,
    `Central venous catheter`,
    `Foley catheter`,
    `Nasogastric tube`,
    `Endotracheal tube`,
    `Pigtail catheter`,
    Hemovac,
    `Biliary drain`,
    `Chest tube`,
    Ostomy,
    Cystostomy,
    `Previous antibiotic`,
    Fluoroquinolone,
    Cephalosporin,
    Carbapenem,
    `β-lactam/β-lactamase inhibitor`,
    Aminoglycoside,
    `Admission to long-term care facility`,
    VRE,
    Endoscopy
  ) %>%
  tbl_summary(
    by = CPE,
    statistic = list(
      all_continuous() ~ "{median} ({p25}, {p75})",
      all_categorical() ~ "{n} ({p}%)"
    ),
    digits = all_continuous() ~ 1,
    missing = "no"
  ) %>%
  add_p(test = all_continuous() ~ "wilcox.test") %>%
  modify_header(label ~ "**Variable**") %>%
  bold_labels()

# ===== Export to Word =====
doc <- read_docx()
doc <- body_add_flextable(doc, value = as_flex_table(table1))
print(doc, target = "Table1_CPE_AllPatients.docx")

# ===== Export to Excel =====
table1_export <- as_tibble(table1$table_body)
write_xlsx(table1_export, "Table1_CPE_AllPatients.xlsx")
