from otree.api import *

doc = """
Read quiz questions from a CSV (simple version).
See also the 'complex' version of this app. 
"""


def read_csv():
    import csv

    f = open(__name__ + '/stimuli.csv', encoding='utf-8-sig')
    rows = list(csv.DictReader(f))
    return rows


class C(BaseConstants):
    NAME_IN_URL = 'questions_from_csv_simple'
    PLAYERS_PER_GROUP = None
    QUESTIONS = read_csv()
    NUM_ROUNDS = len(QUESTIONS)


class Subsession(BaseSubsession):
    pass


def creating_session(subsession: Subsession):
    current_question = C.QUESTIONS[subsession.round_number - 1]
    for p in subsession.get_players():
        p.question = current_question['question']
        p.optionA = current_question['optionA']
        p.optionB = current_question['optionB']
        p.optionC = current_question['optionC']
        p.solution = current_question['solution']

        p.participant.quiz_num_correct = 0


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    question = models.StringField()
    optionA = models.StringField()
    optionB = models.StringField()
    optionC = models.StringField()
    solution = models.StringField()
    choice = models.StringField(widget=widgets.RadioSelect)
    is_correct = models.BooleanField()


def choice_choices(player: Player):
    return [
        ['A', player.optionA],
        ['B', player.optionB],
        ['C', player.optionC],
    ]


class Stimuli(Page):
    form_model = 'player'
    form_fields = ['choice']

    @staticmethod
    def before_next_page(player: Player, timeout_happened):
        participant = player.participant

        player.is_correct = player.choice == player.solution
        participant.quiz_num_correct += int(player.is_correct)


class Results(Page):
    @staticmethod
    def is_displayed(player: Player):
        return player.round_number == C.NUM_ROUNDS

    @staticmethod
    def vars_for_template(player: Player):
        return dict(round_players=player.in_all_rounds())


page_sequence = [Stimuli, Results]
