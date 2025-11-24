Prerequisites

Before you begin, ensure you have the following installed:
Python 3.7+ (3.8 or higher recommended)
pip (Python package manager)
Git (for cloning the repository)
Sufficient disk space for model weights and datasets

System Requirements

RAM: Minimum 4GB (8GB+ recommended for batch processing)
GPU: Optional but recommended for faster inference (NVIDIA GPU with CUDA support)
OS: Windows, macOS, or Linux

Installation

Step 1: Clone the Repository
git clone https://github.com/Soundarya21-age/Classfier.git
cd Classfier
Step 2: Create a Virtual Environment (Recommended)
# Using venv
python -m venv venv
# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
Step 3: Install Dependencies
pip install -r requirements.txt

README.md
Classfier
A machine learning classification project for automated age and facial feature detection.

📋 Table of Contents
Overview

Features

Prerequisites

Installation

Usage

Project Structure

Requirements

Contributing

License

Acknowledgments

🎯 Overview
Classfier is a Python-based machine learning classification system designed to classify facial features, particularly focusing on age detection and facial attribute recognition. The project leverages deep learning and computer vision techniques to analyze facial images and predict demographic attributes with high accuracy.

This project is particularly useful for:

Automated age estimation from facial images

Demographic analysis and profiling

Facial attribute classification

Building computer vision pipelines with deep learning models

✨ Features
Facial Age Classification: Accurately classify ages from facial images into predefined age groups

Multiple Model Support: Implements various machine learning and deep learning models for comparison

Image Preprocessing: Robust image handling and preprocessing pipeline

Batch Processing: Process multiple images efficiently

Modular Architecture: Well-organized code structure for easy extension and modification

Data Visualization: Generate visualizations of model predictions and results

Easy Integration: Simple API for integrating into larger applications

📋 Prerequisites
Before you begin, ensure you have the following installed:

Python 3.7+ (3.8 or higher recommended)

pip (Python package manager)

Git (for cloning the repository)

Sufficient disk space for model weights and datasets

System Requirements
RAM: Minimum 4GB (8GB+ recommended for batch processing)

GPU: Optional but recommended for faster inference (NVIDIA GPU with CUDA support)

OS: Windows, macOS, or Linux

🚀 Installation
Step 1: Clone the Repository
bash
git clone https://github.com/Soundarya21-age/Classfier.git
cd Classfier
Step 2: Create a Virtual Environment (Recommended)
bash
# Using venv
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
Step 3: Install Dependencies
bash
pip install -r requirements.txt
Or install the required packages manually:
pip install tensorflow
pip install keras
pip install opencv-python
pip install numpy
pip install pandas
pip install matplotlib
pip install scikit-learn










clone the repository
navigate to frontend folder and npm install 
navigate to backend folder and install requirements.txt
to run frontend : npm run dev
to run backend: uvicorn main:app --reload --host 0.0.0.0 --port 8000
