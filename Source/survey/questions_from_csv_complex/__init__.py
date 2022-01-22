from otree.api import *

doc = """
Read quiz questions from a CSV (complex version).
See also the 'simple' version.
It would be much simpler to implement this using rounds (1 question per round),
as is done in the 'simple' version; however, this approach
has faster gameplay since it's all done in 1 page, and leads to a more compact
data export. Consider using this version if you have many questions or if speed is a high priority. 
"""


class C(BaseConstants):
    NAME_IN_URL = 'questions_from_csv_complex'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 1


def read_csv():
    import csv
    import random

    f = open(__name__ + '/stimuli.csv', encoding='utf-8-sig')
    rows = list(csv.DictReader(f))

    random.shuffle(rows)
    return rows


class Subsession(BaseSubsession):
    pass


def creating_session(subsession: Subsession):
    for p in subsession.get_players():
        stimuli = read_csv()
        p.num_trials = len(stimuli)
        for stim in stimuli:
            # print('stim is', stim)
            # ** is the Python operator to unpack the dict
            Trial.create(player=p, **stim)


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    num_correct = models.IntegerField(initial=0)
    raw_responses = models.LongStringField()


class Trial(ExtraModel):
    player = models.Link(Player)
    question = models.StringField()
    optionA = models.StringField()
    optionB = models.StringField()
    optionC = models.StringField()
    solution = models.StringField()
    choice = models.StringField()
    is_correct = models.BooleanField()


def to_dict(trial: Trial):
    return dict(
        question=trial.question,
        optionA=trial.optionA,
        optionB=trial.optionB,
        optionC=trial.optionC,
        id=trial.id,
    )


# PAGES
class Stimuli(Page):
    form_model = 'player'
    form_fields = ['raw_responses']

    @staticmethod
    def js_vars(player: Player):
        stimuli = [to_dict(trial) for trial in Trial.filter(player=player)]
        return dict(trials=stimuli)

    @staticmethod
    def before_next_page(player: Player, timeout_happened):
        import json

        responses = json.loads(player.raw_responses)
        for trial in Trial.filter(player=player):
            # have to use str() because Javascript implicitly converts keys to strings
            trial.choice = responses[str(trial.id)]
            trial.is_correct = trial.choice == trial.solution
            # convert True/False to 1/0
            player.num_correct += int(trial.is_correct)
        # don't need it anymore
        player.raw_responses = ''


class Results(Page):
    @staticmethod
    def vars_for_template(player: Player):
        return dict(trials=Trial.filter(player=player))


page_sequence = [Stimuli, Results]


def custom_export(players):
    yield ['participant', 'question', 'choice', 'is_correct']

    for player in players:
        participant = player.participant

        trials = Trial.filter(player=player)

        for t in trials:
            yield [participant.code, t.question, t.choice, t.is_correct]
