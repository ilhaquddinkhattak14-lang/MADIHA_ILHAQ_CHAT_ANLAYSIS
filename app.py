from flask import Flask, render_template, request
import preprocessing, helper
import matplotlib.pyplot as plt
import os

app = Flask(__name__)

@app.route("/", methods=["GET","POST"])
def index():
    if request.method == "POST":
        file = request.files["chatfile"]
        data = file.read().decode("utf-8")
        df = preprocessing.preprocess(data)

        users = df['user'].unique().tolist()
        users.remove("group_notification")
        users.sort()
        users.insert(0,"Overall")

        selected_user = request.form.get("user")
        if selected_user != "Overall":
            df = df[df["user"] == selected_user]

        stats = helper.fetch_stats(selected_user, df)

        return render_template("index.html", users=users, stats=stats)

    return render_template("index.html")

app.run(debug=True)
