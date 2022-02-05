from otree.api import *

doc = """
break
"""


class C(BaseConstants):
    NAME_IN_URL = 'goodbye'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 1
    


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    pass

# PAGES
class MyPage(Page):
    pass

page_sequence = [MyPage]