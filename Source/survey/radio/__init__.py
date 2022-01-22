from otree.api import *


doc = """
Radio buttons in various layouts, looping over radio choices
"""


class C(BaseConstants):
    NAME_IN_URL = 'radio'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 1


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    f1 = models.IntegerField(
        widget=widgets.RadioSelect, choices=[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    )
    f2 = models.IntegerField(
        widget=widgets.RadioSelect, choices=[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    )


# PAGES
class MyPage(Page):
    form_model = 'player'
    form_fields = ['f1', 'f2']



page_sequence = [MyPage]
