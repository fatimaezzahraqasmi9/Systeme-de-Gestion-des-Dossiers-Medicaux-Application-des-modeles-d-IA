import joblib, json

m = joblib.load("model/model.pkl")
print("TYPE:", type(m))
print("IS_DICT:", isinstance(m, dict))

if isinstance(m, dict):
    print("KEYS:", list(m.keys()))
else:
    print("HAS_predict:", hasattr(m, "predict"))
    print("HAS_predict_proba:", hasattr(m, "predict_proba"))
    print("n_features_in_:", getattr(m, "n_features_in_", None))
    fni = getattr(m, "feature_names_in_", None)
    print("HAS_feature_names_in_:", fni is not None)
    if fni is not None:
        print("N_FEATURES:", len(fni))
        print("FEATURES_JSON:", json.dumps(list(fni)))
    cls = getattr(m, "classes_", None)
    if cls is not None:
        print("N_CLASSES:", len(cls))
        print("CLASSES_JSON:", json.dumps([str(c) for c in cls]))
