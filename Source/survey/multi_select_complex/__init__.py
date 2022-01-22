from otree.api import *


doc = """
Question that lets you select multiple options
(multi-select, multiple choice / multiple answer)

The difference is that this one lets you customize the label of each checkbox,
and requires at least 1 to be selected.
"""


class C(BaseConstants):
    NAME_IN_URL = 'multi_select_complex'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 1
    LANGUAGES = [
        dict(name='english', label="I speak English"),
        dict(name='french', label="Je parle français"),
        dict(name='spanish', label="Hablo español"),
        dict(name='finnish', label="Puhun suomea"),
    ]


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    english = models.BooleanField(blank=True)
    french = models.BooleanField(blank=True)
    spanish = models.BooleanField(blank=True)
    finnish = models.BooleanField(blank=True)


# PAGES
class MyPage(Page):
    form_model = 'player'

    @staticmethod
    def get_form_fields(player: Player):
        return [lang['name'] for lang in C.LANGUAGES]

    @staticmethod
    def error_message(player: Player, values):
        # print('values is', values)
        num_selected = 0
        for lang in C.LANGUAGES:
            if values[lang['name']]:
                num_selected += 1
        if num_selected < 1:
            return "You must select at least 1 language."


page_sequence = [MyPage]
