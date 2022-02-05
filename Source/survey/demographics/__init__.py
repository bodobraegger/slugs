from otree.api import *

doc = """
demographcis
"""


class C(BaseConstants):
    NAME_IN_URL = 'demographics'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 1
    


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    gender = models.StringField(choices=['Female', 'Male', 'Other', 'Prefer not to say'], blank=True)
    age = models.IntegerField(min=10, max=20)
    mother_tongue = models.StringField()
    english_understanding = models.StringField(choices=['Elementary', 'Limited', 'Good'])
    math_grade = models.IntegerField(min=1, max=6, label="What was your last math grade-score?<br> Please give it in a scale of 1 to 6, 6 being the best (equivalent to an A or 100% in some grading schemes).")
    video_games = models.StringField(choices=["Every day", "Several times a week", "Once a week", "Once a month", "Less"])
    cs_experience = models.BooleanField(choices=['Yes', 'No'], label = 'I have had a Computer Science course or experience in programming.')
    js_experience = models.BooleanField(choices=['Yes', 'No'], label = 'Have you worked with JavaScript before?')


class PageInherit(Page):
    form_model = 'player'

# PAGES
class MyPage(PageInherit):
    form_model = 'player'
    form_fields = ['gender', 'age', 'mother_tongue', 'english_understanding', 'math_grade', 'video_games', 'cs_experience', 'js_experience',]

page_sequence = [MyPage]