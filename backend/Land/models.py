from django.db import models

class Land(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    area = models.FloatField()  # Area in square meters
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='land_images/')
    available = models.BooleanField(default=True)  # Corrected spelling from "Avaialable"
    land_category = models.CharField(max_length=100)  # Define land category
    tehsil_name = models.CharField(max_length=100)  # Define tehsil name
    district_name = models.CharField(max_length=100)  # Define district name
    state = models.CharField(max_length=100)  # Define state

    def __str__(self):
        return f"{self.name} ({self.location})"
