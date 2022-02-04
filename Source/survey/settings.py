from os import environ

SESSION_CONFIGS = [
    # dict(
    #     name='public_goods',
    #     app_sequence=['public_goods'],
    #     num_demo_participants=3,
    # ),
]

# if you set a property in SESSION_CONFIG_DEFAULTS, it will be inherited by all configs
# in SESSION_CONFIGS, except those that explicitly override it.
# the session config can be accessed from methods in your apps as self.session.config,
# e.g. self.session.config['participation_fee']

SESSION_CONFIG_DEFAULTS = dict(
    real_world_currency_per_point=1.00, participation_fee=0.00, doc=""
)

PARTICIPANT_FIELDS = []
SESSION_FIELDS = []

# ISO-639 code
# for example: de, fr, ja, ko, zh-hans
LANGUAGE_CODE = 'en'

# e.g. EUR, GBP, CNY, JPY
REAL_WORLD_CURRENCY_CODE = 'USD'
USE_POINTS = True

ADMIN_USERNAME = 'admin'
# for security, best to set admin password in an environment variable
ADMIN_PASSWORD = environ.get('OTREE_ADMIN_PASSWORD')

DEMO_PAGE_INTRO_HTML = """ """

SECRET_KEY = '8398568838707'


from os import environ

# if you set a property in SESSION_CONFIG_DEFAULTS, it will be inherited by all configs
# in SESSION_CONFIGS, except those that explicitly override it.
# the session config can be accessed from methods in your apps as self.session.config,
# e.g. session.config['participation_fee']

SESSION_CONFIG_DEFAULTS = dict(
    real_world_currency_per_point=0.000, participation_fee=0.00, doc=""
)

SESSION_CONFIGS = [
    dict(
        name='questionnaires_part_1',
        display_name="questionnaires_part_1",
        num_demo_participants=1,
        app_sequence=['demographics', 'survey', 'break'],
        questionnaire = 'questions_pre.csv'
    ),
    dict(
        name='questionnaires_part_2',
        display_name="questionnaires_part_2",
        num_demo_participants=1,
        app_sequence=['learning', 'break'],
        include_js_test=False
    ),
    dict(
        name='questionnaires_part_3',
        display_name="questionnaires_part_3",
        num_demo_participants=1,
        app_sequence=['survey', 'break'],
        questionnaire = 'questions_mid.csv'
    ),
    dict(
        name='questionnaires_part_4',
        display_name="questionnaires_part_4",
        num_demo_participants=1,
        app_sequence=['survey', 'break'],
        questionnaire = 'questions_post.csv'
    ),
    dict(
        name='questionnaires_part_5',
        display_name="questionnaires_part_5",
        num_demo_participants=1,
        app_sequence=['learning', 'break'],
        questionnaire = 'questions_post.csv',
        include_js_test=True
    ),
    dict(
        name='demographics',
        display_name="demographics",
        num_demo_participants=1,
        app_sequence=['demographics'],
    ),
    dict(
        name='learning_pre',
        display_name="learning_pre",
        num_demo_participants=1,
        app_sequence=['learning'],
        include_js_test=True
    ),
    dict(
        name='learning_post',
        display_name="learning_post",
        num_demo_participants=1,
        app_sequence=['learning'],
        include_js_test=True
    ),
    dict(
        name='pre_test_with_questionnaires',
        display_name="learning_both",
        num_demo_participants=1,
        app_sequence=['demographics', 'survey'],
        include_js_test=False
    ),
    dict(
        name='survey',
        display_name="survey",
        num_demo_participants=1,
        app_sequence=['survey'],
        questionnaire = 'questions.csv',
    ),
]

INSTALLED_APPS=['otree']