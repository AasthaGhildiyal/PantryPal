from flask import Flask, render_template, request, jsonify
import os
import requests
from dotenv import load_dotenv

load_dotenv()

IBM_API_KEY = os.getenv("IBM_API_KEY")
IBM_PROJECT_ID = os.getenv("IBM_PROJECT_ID")
IBM_URL = os.getenv("IBM_URL", "https://us-south.ml.cloud.ibm.com")

import json
import os
import re

def get_ibm_token():
    response = requests.post(
        "https://iam.cloud.ibm.com/identity/token",
        data={
            "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
            "apikey": IBM_API_KEY
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=30
    )
    response.raise_for_status()
    return response.json()["access_token"]


def generate_granite_advice(ingredients, recipe_title):
    if not IBM_API_KEY or not IBM_PROJECT_ID:
        raise ValueError("IBM API key or Project ID is missing from .env")

    token = get_ibm_token()

    prompt = f"""
    You are PantryPal, a friendly cooking assistant.

    The user's available ingredients are: {ingredients}
    The selected recipe is: {recipe_title}

    Give the user:
    1. Simple step-by-step cooking instructions.
    2. Possible ingredient substitutions.
    3. Two useful cooking tips.
    4. A suggestion to reduce food waste.

    Use beginner-friendly language. Do not assume the user has
    ingredients they have not mentioned. Clearly label any extra
    ingredients that may be needed.
    """

    response = requests.post(
        f"{IBM_URL.rstrip('/')}/ml/v1/text/generation?version=2023-05-29",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        json={
           "model_id": "ibm/granite-4-h-small",
            "project_id": IBM_PROJECT_ID,
            "input": prompt,
            "parameters": {
                "decoding_method": "greedy",
                "max_new_tokens": 400,
                "min_new_tokens": 50
            }
        },
        timeout=90
    )

    if not response.ok:
        print("IBM STATUS:", response.status_code)
        print("IBM ERROR DETAILS:", response.text)
        raise Exception(
            f"IBM returned {response.status_code}: {response.text}"
        )

    return response.json()["results"][0]["generated_text"]

app = Flask(__name__)

DATA_FILE = os.path.join("data", "recipes.json")


def load_recipes():
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def normalize(text):
    return re.sub(r"[^a-z0-9 ]", "", text.lower()).strip()


def retrieve_recipes(user_ingredients, diet):
    recipes = load_recipes()
    user_items = [normalize(item) for item in user_ingredients.split(",")]
    user_items = [item for item in user_items if item]

    results = []

    for recipe in recipes:
        recipe_ingredients = recipe["ingredients"]

        if diet == "Vegan" and recipe["diet"] != "Vegan":
            continue

        if diet == "Vegetarian" and recipe["diet"] not in [
            "Vegetarian", "Vegan", "High Protein"
        ]:
            continue

        matched = [
            item for item in recipe_ingredients
            if any(
                user_item == normalize(item)
                or user_item in normalize(item)
                or normalize(item) in user_item
                for user_item in user_items
            )
        ]

        if not matched:
            continue

        missing = [
            item for item in recipe_ingredients
            if item not in matched and item not in ["salt", "water", "oil"]
        ]

        score = len(matched) / len(recipe_ingredients)

        results.append({
            **recipe,
            "matched": matched,
            "missing": missing,
            "score": round(score * 100)
        })

    results.sort(key=lambda item: item["score"], reverse=True)
    return results[:6]


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/recipes", methods=["POST"])
def get_recipes():
    data = request.get_json(silent=True) or {}

    ingredients = data.get("ingredients", "")
    diet = data.get("diet", "Any")

    if not ingredients.strip():
        return jsonify({"error": "Please enter ingredients"}), 400

    recipes = retrieve_recipes(ingredients, diet)

    return jsonify({
        "recipes": recipes,
        "message": "Recipes retrieved from the PantryPal knowledge base."
    })


@app.route("/api/ask-granite", methods=["POST"])
def ask_granite():
    data = request.get_json(silent=True) or {}

    ingredients = data.get("ingredients", "")
    recipe_title = data.get("recipe_title", "")

    if not ingredients or not recipe_title:
        return jsonify({"error": "Ingredients and recipe title are required."}), 400

    try:
        advice = generate_granite_advice(ingredients, recipe_title)
        return jsonify({
            "success": True,
            "advice": advice
        })
    except Exception as error:
        print("Granite API error:", str(error))
        return jsonify({
            "success": False,
            "error": str(error)
        }), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)

    
