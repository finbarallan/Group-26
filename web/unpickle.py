import os
import sys
import pickle
import pandas as pd
from sklearn.model_selection import train_test_split
from datetime import datetime


def pickle_predict(station_number, weather, description, temp, feels_like, humidity, wind_speed, day, hour):
    station_number = station_number  # replace with the desired station number

    if int(day) >=1 or int(day) <= 5:
        day = 'Weekday'
    else:
        day = 'Weekend'

    # Prepare input data for prediction (replace with actual values)
    input_data = {
        'Weather': weather,
        'Description': description,
        'Temp': temp,
        'Feels Like': feels_like,
        'Humidity': humidity,
        'Wind Speed': wind_speed,
        'Day': day,
        'Hour': hour
    }

    input_df = pd.DataFrame([input_data])

    # Replace 'unique_folder_or_file' with a unique top-level folder name or specific file or folder in your project root
    project_root = find_project_root('Group-26')

    # Load the cleaned_training_dataset_2.csv file
    training_data_path = os.path.join(project_root, 'Group-26/machine-learning/cleaned_training_dataset_2.csv')
    df = pd.read_csv(training_data_path)
    print("#3", training_data_path)

    # Filter the data for the specific station
    df_station = df[df['Station'] == int(station_number)]

    # One-hot encode the categorical features
    DF = pd.get_dummies(df_station, columns=['Station', 'Weather', 'Description', 'Day', 'Hour'])

    # Separate features and targets
    X = DF.drop(['Available Bikes', 'Available Stands'], axis=1)
    y_bikes = DF['Available Bikes']
    y_stands = DF['Available Stands']

    # Perform one-hot encoding for categorical features (similar to the training data)
    cat_columns = ['Weather', 'Description', 'Day', 'Hour']
    input_df = pd.get_dummies(input_df, columns=cat_columns)

    bikes_model_filename = os.path.join(project_root, f"Group-26/machine-learning/pickle-files/bikes_station_{station_number}.pkl")
    stands_model_filename = os.path.join(project_root, f"Group-26/machine-learning/pickle-files/stands_station_{station_number}.pkl")

    bikes_model = pickle.load(open(bikes_model_filename, 'rb'))
    stands_model = pickle.load(open(stands_model_filename, 'rb'))

    # Split the data into train and test sets
    X_train, X_test, y_train_bikes, y_test_bikes, y_train_stands, y_test_stands = train_test_split(X, y_bikes, y_stands, test_size=0.2, random_state=36)

    # Make sure the columns in the input dataframe are in the same order as the training data.
    # Add missing columns with all 0s
    missing_columns = set(X_train.columns) - set(input_df.columns)
    for col in missing_columns:
        input_df[col] = 0

    input_df = input_df[X_train.columns]  # Reorder columns to match the training data

    predicted_bikes = bikes_model.predict(input_df)
    predicted_stands = stands_model.predict(input_df)

    transpose = input_df.transpose()
    print(transpose)

    return (f"{predicted_bikes[0]:.0f}", f"{predicted_stands[0]:.0f}")

def find_project_root(search_file_or_folder):
    current_path = os.path.abspath(os.getcwd())

    while True:
        if os.path.exists(os.path.join(current_path, search_file_or_folder)):
            return current_path

        parent_path = os.path.dirname(current_path)

        if parent_path == current_path:
            raise FileNotFoundError(f"Could not find {search_file_or_folder} in any parent directories.")
        current_path = parent_path
