"""XGBoost model training with RandomizedSearchCV."""
import os
import joblib
import numpy as np
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from xgboost import XGBClassifier

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "../../artifacts")

PARAM_DISTRIBUTIONS = {
    "n_estimators":     [100, 200, 300, 500],
    "max_depth":        [3, 4, 5, 6, 7],
    "learning_rate":    [0.01, 0.05, 0.1, 0.2],
    "subsample":        [0.6, 0.7, 0.8, 0.9, 1.0],
    "colsample_bytree": [0.6, 0.7, 0.8, 0.9, 1.0],
    "min_child_weight": [1, 3, 5, 7],
}


def train_model(X_train, y_train, scale_pos_weight: float = 1.54):
    """Train XGBoost with RandomizedSearchCV; return best estimator."""
    base_clf = XGBClassifier(
        scale_pos_weight=scale_pos_weight,
        eval_metric="logloss",
        random_state=42,
        n_jobs=-1,
    )

    search = RandomizedSearchCV(
        base_clf,
        PARAM_DISTRIBUTIONS,
        n_iter=50,
        cv=5,
        scoring="roc_auc",
        random_state=42,
        n_jobs=-1,
        verbose=1,
    )
    search.fit(X_train, y_train)
    best_model = search.best_estimator_
    print(f"[train] Best params: {search.best_params_}")
    print(f"[train] Best CV ROC-AUC: {search.best_score_:.4f}")

    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    model_path = os.path.join(ARTIFACTS_DIR, "model.joblib")
    joblib.dump(best_model, model_path)
    print(f"[train] Model saved to {model_path}")

    return best_model, search.best_params_


def split_data(X, y, test_size: float = 0.2, random_state: int = 42):
    """80/20 stratified train/test split."""
    return train_test_split(X, y, test_size=test_size, stratify=y, random_state=random_state)
