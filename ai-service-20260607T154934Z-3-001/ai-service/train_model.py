"""
Script d'entrainement du modele de prediction de maladies.
Dataset : Disease Prediction Using Machine Learning (Kaggle) - 132 symptomes, 41 maladies.
"""
import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

SYMPTOMS = [
    "itching","skin_rash","nodal_skin_eruptions","continuous_sneezing","shivering","chills",
    "joint_pain","stomach_pain","acidity","ulcers_on_tongue","muscle_wasting","vomiting",
    "burning_micturition","spotting_ urination","fatigue","weight_gain","anxiety",
    "cold_hands_and_feets","mood_swings","weight_loss","restlessness","lethargy",
    "patches_in_throat","irregular_sugar_level","cough","high_fever","sunken_eyes",
    "breathlessness","sweating","dehydration","indigestion","headache","yellowish_skin",
    "dark_urine","nausea","loss_of_appetite","pain_behind_the_eyes","back_pain",
    "constipation","abdominal_pain","diarrhoea","mild_fever","yellow_urine",
    "yellowing_of_eyes","acute_liver_failure","fluid_overload","swelling_of_stomach",
    "swelled_lymph_nodes","malaise","blurred_and_distorted_vision","phlegm",
    "throat_irritation","redness_of_eyes","sinus_pressure","runny_nose","congestion",
    "chest_pain","weakness_in_limbs","fast_heart_rate","pain_during_bowel_movements",
    "pain_in_anal_region","bloody_stool","irritation_in_anus","neck_pain","dizziness",
    "cramps","bruising","obesity","swollen_legs","swollen_blood_vessels",
    "puffy_face_and_eyes","enlarged_thyroid","brittle_nails","swollen_extremeties",
    "excessive_hunger","extra_marital_contacts","drying_and_tingling_lips","slurred_speech",
    "knee_pain","hip_joint_pain","muscle_weakness","stiff_neck","swelling_joints",
    "movement_stiffness","spinning_movements","loss_of_balance","unsteadiness",
    "weakness_of_one_body_side","loss_of_smell","bladder_discomfort","foul_smell_of urine",
    "continuous_feel_of_urine","passage_of_gases","internal_itching","toxic_look_(typhos)",
    "depression","irritability","muscle_pain","altered_sensorium","red_spots_over_body",
    "belly_pain","abnormal_menstruation","dischromic _patches","watering_from_eyes",
    "increased_appetite","polyuria","family_history","mucoid_sputum","rusty_sputum",
    "lack_of_concentration","visual_disturbances","receiving_blood_transfusion",
    "receiving_unsterile_injections","coma","stomach_bleeding","distention_of_abdomen",
    "history_of_alcohol_consumption","fluid_overload.1","blood_in_sputum",
    "prominent_veins_on_calf","palpitations","painful_walking","pus_filled_pimples",
    "blackheads","scurring","skin_peeling","silver_like_dusting","small_dents_in_nails",
    "inflammatory_nails","blister","red_sore_around_nose","yellow_crust_ooze",
]

DISEASE_SYMPTOMS = {
    "Fungal infection":       ["itching","skin_rash","nodal_skin_eruptions","dischromic _patches"],
    "Allergy":                ["continuous_sneezing","shivering","chills","watering_from_eyes","runny_nose"],
    "GERD":                   ["stomach_pain","acidity","ulcers_on_tongue","vomiting","indigestion","chest_pain"],
    "Chronic cholestasis":    ["itching","vomiting","yellowish_skin","nausea","loss_of_appetite","yellow_urine","yellowing_of_eyes"],
    "Drug Reaction":          ["itching","skin_rash","stomach_pain","burning_micturition","spotting_ urination"],
    "Peptic ulcer diseae":    ["vomiting","indigestion","loss_of_appetite","abdominal_pain","fatigue","passage_of_gases"],
    "AIDS":                   ["muscle_wasting","fatigue","high_fever","extra_marital_contacts","receiving_unsterile_injections","receiving_blood_transfusion"],
    "Diabetes":               ["fatigue","weight_loss","restlessness","lethargy","irregular_sugar_level","excessive_hunger","polyuria","increased_appetite"],
    "Gastroenteritis":        ["vomiting","sunken_eyes","dehydration","diarrhoea","stomach_pain"],
    "Bronchial Asthma":       ["fatigue","cough","high_fever","breathlessness","family_history","mucoid_sputum"],
    "Hypertension":           ["headache","chest_pain","dizziness","loss_of_balance","lack_of_concentration"],
    "Migraine":               ["acidity","indigestion","headache","blurred_and_distorted_vision","excessive_hunger","stiff_neck","irritability","visual_disturbances"],
    "Cervical spondylosis":   ["back_pain","weakness_in_limbs","neck_pain","dizziness","loss_of_balance"],
    "Paralysis (brain hemorrhage)": ["vomiting","headache","weakness_of_one_body_side","slurred_speech","altered_sensorium"],
    "Jaundice":               ["itching","vomiting","fatigue","weight_loss","high_fever","yellowish_skin","dark_urine","abdominal_pain"],
    "Malaria":                ["chills","vomiting","high_fever","sweating","headache","nausea","diarrhoea","muscle_pain"],
    "Chicken pox":            ["itching","skin_rash","fatigue","lethargy","high_fever","headache","loss_of_appetite","mild_fever","swelled_lymph_nodes","malaise","red_spots_over_body"],
    "Dengue":                 ["skin_rash","chills","joint_pain","vomiting","fatigue","high_fever","headache","nausea","loss_of_appetite","pain_behind_the_eyes","back_pain","malaise","muscle_pain","red_spots_over_body"],
    "Typhoid":                ["chills","vomiting","fatigue","high_fever","headache","nausea","constipation","abdominal_pain","diarrhoea","toxic_look_(typhos)","belly_pain"],
    "Hepatitis A":            ["joint_pain","vomiting","yellowish_skin","dark_urine","nausea","loss_of_appetite","abdominal_pain","diarrhoea","mild_fever","yellowing_of_eyes","muscle_pain"],
    "Hepatitis B":            ["itching","fatigue","lethargy","yellowish_skin","dark_urine","loss_of_appetite","abdominal_pain","yellow_urine","yellowing_of_eyes","malaise","receiving_blood_transfusion","receiving_unsterile_injections"],
    "Hepatitis C":            ["fatigue","yellowish_skin","nausea","loss_of_appetite","yellowing_of_eyes","family_history","receiving_blood_transfusion"],
    "Hepatitis D":            ["joint_pain","vomiting","fatigue","yellowish_skin","dark_urine","nausea","loss_of_appetite","abdominal_pain","yellowing_of_eyes"],
    "Hepatitis E":            ["joint_pain","vomiting","fatigue","high_fever","yellowish_skin","dark_urine","nausea","loss_of_appetite","abdominal_pain","yellowing_of_eyes","acute_liver_failure","coma","stomach_bleeding"],
    "Alcoholic hepatitis":    ["vomiting","yellowish_skin","abdominal_pain","swelling_of_stomach","history_of_alcohol_consumption","fluid_overload","distention_of_abdomen"],
    "Tuberculosis":           ["chills","vomiting","fatigue","weight_loss","cough","high_fever","breathlessness","sweating","loss_of_appetite","mild_fever","yellowing_of_eyes","swelled_lymph_nodes","malaise","phlegm","blood_in_sputum","rusty_sputum"],
    "Common Cold":            ["continuous_sneezing","chills","fatigue","cough","headache","runny_nose","congestion","loss_of_appetite","phlegm","throat_irritation","redness_of_eyes","sinus_pressure","mild_fever","muscle_pain"],
    "Pneumonia":              ["chills","fatigue","cough","high_fever","breathlessness","sweating","malaise","phlegm","blood_in_sputum","rusty_sputum","chest_pain"],
    "Dimorphic hemmorhoids(piles)": ["constipation","pain_during_bowel_movements","pain_in_anal_region","bloody_stool","irritation_in_anus"],
    "Heart attack":           ["vomiting","breathlessness","sweating","chest_pain","fast_heart_rate"],
    "Varicose veins":         ["fatigue","cramps","bruising","obesity","swollen_legs","swollen_blood_vessels","prominent_veins_on_calf"],
    "Hypothyroidism":         ["fatigue","weight_gain","cold_hands_and_feets","mood_swings","lethargy","dizziness","puffy_face_and_eyes","enlarged_thyroid","brittle_nails","swollen_extremeties","depression","irritability","abnormal_menstruation"],
    "Hyperthyroidism":        ["fatigue","mood_swings","weight_loss","restlessness","sweating","diarrhoea","fast_heart_rate","excessive_hunger","muscle_weakness","irritability","abnormal_menstruation"],
    "Hypoglycemia":           ["fatigue","anxiety","sweating","headache","nausea","blurred_and_distorted_vision","slurred_speech","irritability","muscle_weakness","palpitations"],
    "Osteoarthristis":        ["joint_pain","neck_pain","knee_pain","hip_joint_pain","swelling_joints","painful_walking"],
    "Arthritis":              ["muscle_weakness","stiff_neck","swelling_joints","movement_stiffness","painful_walking"],
    "(vertigo) Paroymsal Positional Vertigo": ["vomiting","headache","nausea","spinning_movements","loss_of_balance","unsteadiness"],
    "Acne":                   ["skin_rash","pus_filled_pimples","blackheads","scurring"],
    "Urinary tract infection": ["burning_micturition","bladder_discomfort","foul_smell_of urine","continuous_feel_of_urine"],
    "Psoriasis":              ["skin_rash","joint_pain","skin_peeling","silver_like_dusting","small_dents_in_nails","inflammatory_nails"],
    "Impetigo":               ["skin_rash","high_fever","blister","red_sore_around_nose","yellow_crust_ooze"],
}


def generer_dataset(n_par_maladie=120):
    rng = np.random.RandomState(42)
    rows, labels = [], []
    for disease, core in DISEASE_SYMPTOMS.items():
        valid_core = [s for s in core if s in SYMPTOMS]
        for _ in range(n_par_maladie):
            row = {s: 0 for s in SYMPTOMS}
            n = max(1, len(valid_core) - rng.randint(0, min(3, len(valid_core))))
            for s in rng.choice(valid_core, size=n, replace=False):
                row[s] = 1
            noise_pool = [s for s in SYMPTOMS if row[s] == 0]
            if noise_pool:
                for s in rng.choice(noise_pool, size=min(rng.randint(0, 3), len(noise_pool)), replace=False):
                    row[s] = 1
            rows.append(row)
            labels.append(disease)
    return pd.DataFrame(rows, columns=SYMPTOMS), pd.Series(labels)


if __name__ == "__main__":
    print("Generation du dataset...")
    X, y = generer_dataset()
    print(f"  {len(X)} echantillons | {X.shape[1]} features | {y.nunique()} maladies")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print("Entrainement RandomForestClassifier...")
    model = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    print(f"  Accuracy : {model.score(X_test, y_test):.2%}")

    out = Path(__file__).parent / "model" / "model.pkl"
    out.parent.mkdir(exist_ok=True)
    joblib.dump(model, out)
    print(f"  Modele sauvegarde : {out}")
