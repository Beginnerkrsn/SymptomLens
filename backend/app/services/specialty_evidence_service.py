SPECIALTY_EVIDENCE = {
    "Cardiology": {
        "echocardiogram": 4,
        "ejection fraction": 3,
        "left atrium": 2,
        "right atrium": 2,
        "left ventricle": 2,
        "right ventricle": 2,
        "mitral regurgitation": 3,
        "tricuspid regurgitation": 3,
        "aortic valve": 2,
        "cardiac": 2,
        "cardiology": 4,
        "myocardial": 2,
        "electrocardiogram": 3,
        "ecg": 3,
        "ekg": 3,
        "cardiac catheterization": 4,
        "atrial fibrillation": 4,
    },

    "Nephrology": {
        "kidney": 2,
        "renal": 2,
        "creatinine": 3,
        "egfr": 4,
        "glomerular filtration": 4,
        "proteinuria": 4,
        "albuminuria": 4,
        "dialysis": 4,
        "nephrology": 4,
        "renal function": 4,
    },

    "Gastroenterology": {
        "gastrointestinal": 2,
        "gastric": 2,
        "esophagus": 2,
        "oesophagus": 2,
        "reflux": 3,
        "gerd": 3,
        "colon": 2,
        "colonoscopy": 4,
        "endoscopy": 3,
        "duodenum": 3,
        "stomach": 2,
        "intestine": 2,
        "gastroenterology": 4,
    },

    "Neurology": {
        "brain": 3,
        "cerebral": 3,
        "neurological": 3,
        "neurology": 4,
        "seizure": 4,
        "epilepsy": 4,
        "stroke": 4,
        "cerebrovascular": 4,
        "nerve": 2,
        "neural": 2,
        "migraine": 3,
        "multiple sclerosis": 4,
    },

    "Neurosurgery": {
        "neurosurgery": 4,
        "spinal cord": 3,
        "brain tumor": 4,
        "cranial": 3,
        "intracranial": 3,
        "neurosurgical": 4,
        "craniotomy": 4,
        "spine surgery": 4,
    },

    "Orthopedics": {
        "fracture": 4,
        "bone": 2,
        "joint": 2,
        "orthopedic": 4,
        "orthopaedic": 4,
        "ligament": 3,
        "tendon": 3,
        "cartilage": 3,
        "hip": 2,
        "knee": 2,
        "shoulder": 2,
        "wrist": 2,
        "spinal": 2,
    },

    "Ophthalmology": {
        "eye": 2,
        "retina": 4,
        "retinal": 4,
        "cornea": 4,
        "cataract": 4,
        "glaucoma": 4,
        "ophthalmology": 4,
        "visual acuity": 4,
    },

    "ENT / Otolaryngology": {
        "ear": 2,
        "nose": 2,
        "throat": 2,
        "sinus": 3,
        "sinusitis": 3,
        "otolaryngology": 4,
        "tonsil": 3,
        "tonsillitis": 3,
        "hearing": 3,
        "nasal": 2,
    },

    "Obstetrics and Gynecology": {
        "pregnancy": 4,
        "pregnant": 4,
        "obstetric": 4,
        "gynecology": 4,
        "gynecological": 4,
        "uterus": 3,
        "ovary": 3,
        "ovarian": 3,
        "cervix": 3,
        "cervical": 2,
        "prenatal": 4,
        "fetus": 4,
        "fetal": 4,
    },

    "Hematology / Oncology": {
        "cancer": 4,
        "malignancy": 4,
        "tumor": 3,
        "oncology": 4,
        "hematology": 4,
        "leukemia": 4,
        "lymphoma": 4,
        "metastasis": 4,
        "metastatic": 4,
        "hemoglobin": 3,
        "platelet": 3,
    },

    "Psychiatry / Psychology": {
        "psychiatry": 4,
        "psychology": 4,
        "depression": 4,
        "anxiety": 4,
        "bipolar": 4,
        "psychosis": 4,
        "suicidal": 4,
        "mental health": 4,
    },

    "Pain Management": {
        "pain management": 4,
        "chronic pain": 4,
        "epidural": 4,
        "nerve block": 4,
        "pain clinic": 4,
    },

    "General Medicine": {
        "general medicine": 4,
        "internal medicine": 4,
        "primary care": 4,
    },
}


def score_specialties(text: str):
    text_lower = text.lower()

    results = []

    for specialty, keywords in SPECIALTY_EVIDENCE.items():
        matched_keywords = []
        raw_score = 0

        for keyword, weight in keywords.items():
            if keyword in text_lower:
                matched_keywords.append(keyword)
                raw_score += weight

        if raw_score > 0:
            results.append(
                {
                    "specialty": specialty,
                    "raw_score": raw_score,
                    "evidence": matched_keywords,
                }
            )

    results.sort(
        key=lambda item: item["raw_score"],
        reverse=True,
    )

    if not results:
        return []

    maximum = results[0]["raw_score"]

    for item in results:
        item["normalized_score"] = (
            item["raw_score"] / maximum
        )

    return results