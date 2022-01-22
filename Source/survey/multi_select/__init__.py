from otree.api import *


doc = """
Question that lets you select multiple options
(multi-select, multiple choice / multiple answer)
"""


class C(BaseConstants):
    NAME_IN_URL = 'select_multiple'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 1
    LANGUAGES = ['english', 'german', 'french', 'spanish', 'italian', 'chinese']


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    english = models.BooleanField(blank=True)
    german = models.BooleanField(blank=True)
    french = models.BooleanField(blank=True)
    spanish = models.BooleanField(blank=True)
    italian = models.BooleanField(blank=True)
    chinese = models.BooleanField(blank=True)


# PAGES
class MyPage(Page):
    form_model = 'player'
    form_fields = C.LANGUAGES


page_sequence = [MyPage]
