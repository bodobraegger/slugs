from otree.api import *

doc = """
intro
"""


class C(BaseConstants):
    NAME_IN_URL = 'hello'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 1
    


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    pass


# PAGES
class Intro(Page):
    pass

page_sequence = [Intro]