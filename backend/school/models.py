from django.db import models



class School(models.Model):
    name = models.CharField(max_length=255, unique=True)
    address = models.TextField()
    contact_number = models.CharField(max_length=15, blank=True, null=True)
    school_admin = models.ForeignKey('core.User',
                        on_delete=models.CASCADE,
                        related_name='schools',
                        null=True, blank=True)
    boards = models.ManyToManyField(
        'SchoolBoard',
        through='SchoolBoardMapping',
        related_name='schools'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    email = models.EmailField(max_length=255, unique=True, null=True, blank=True)

    class Meta:
        db_table = 'school'

    def __str__(self):
        return self.name
    
class SchoolDbMetadata(models.Model):
    school = models.OneToOneField(School, on_delete=models.CASCADE,
                                  related_name='metadata')
    db_name = models.CharField(max_length=255, unique=True)
    db_user = models.CharField(max_length=100)
    db_password = models.CharField(max_length=100)
    db_host = models.CharField(max_length=100, default='127.0.0.1')
    db_port = models.IntegerField(default=5432)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'school_db_metadata'

    def __str__(self):
        return f"{self.school.name} - {self.db_name}"
    
class SchoolBoard(models.Model):
    board_name = models.CharField(max_length=255, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'school_board'
    
    def __str__(self):
        return self.board_name
    

class SchoolBoardMapping(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE)
    board = models.ForeignKey(SchoolBoard, on_delete=models.CASCADE)

    class Meta:
        db_table = 'school_board_mapping'
        unique_together = ('school', 'board')
