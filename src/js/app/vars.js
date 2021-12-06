
var vars = {
    isPaused: false,
    isPauseLoopFunctions: false,
    isMouseActive: false,

    globeRadius:100,

    loopFunctions: [],

    mouseCoords: {x:0, y:0},

    windowSize:{width:0, height:0},

    // loaded textures will be stored here.
    textures:[],

    // default paths stored here
    path:{
        textures: '/assets/textures/',
    },

    milestones: [
        {
            coords:{lat:42.361145, lng:-71.057083},
            city:'Bostom',
            year: '2016',
            model: '03_Statue_Pillls_3.glb',
            title: 'Where it all began',
            description: 'The Biden administration has called on major companies to help fight the pandemic. Big chains want to get past the holiday staffing crunch first.',
            sound: '',
        },
        {
            coords:{lat:52.370216, lng:4.895168},
            city:'Amsterdam',
            year: '2016',
            model: '03_Statue_Pillls_3.glb',
            title: 'Where it all began',
            description: 'The Biden administration has called on major companies to help fight the pandemic. Big chains want to get past the holiday staffing crunch first.',
            sound: '',
        },
        {
            coords:{lat:26.066700, lng:50.557701},
            city:'Bahrain',
            year: '2016',
            model: '03_Statue_Pillls_3.glb',
            title: 'Where it all began',
            description: 'The Biden administration has called on major companies to help fight the pandemic. Big chains want to get past the holiday staffing crunch first.',
            sound: '',
        },
        {
            coords:{lat:-33.924870, lng:18.424055},
            city:'Cape Town',
            year: '2016',
            model: '03_Statue_Pillls_3.glb',
            title: 'Where it all began',
            description: 'The Biden administration has called on major companies to help fight the pandemic. Big chains want to get past the holiday staffing crunch first.',
            sound: '',
        },
        {
            coords:{lat:-38.162587, lng:144.714231},
            city:'Melbourne',
            year: '2016',
            model: '03_Statue_Pillls_3.glb',
            title: 'Where it all began',
            description: 'The Biden administration has called on major companies to help fight the pandemic. Big chains want to get past the holiday staffing crunch first.',
            sound: '',
        },
        {
            coords:{lat:23.039298, lng:72.534452},
            city:'Ahmadabad',
            year: '2016',
            model: '03_Statue_Pillls_3.glb',
            title: 'Where it all began',
            description: 'The Biden administration has called on major companies to help fight the pandemic. Big chains want to get past the holiday staffing crunch first.',
            sound: '',
        },
        {
            coords:{lat:40.712700, lng:-74.005900},
            city:'New York',
            year: '2016',
            model: '03_Statue_Pillls_3.glb',
            title: 'Where it all began',
            description: 'The Biden administration has called on major companies to help fight the pandemic. Big chains want to get past the holiday staffing crunch first.',
            sound: '',
        },
        {
            coords:{lat:14.604847, lng:120.779970},
            city:'Manila',
            year: '2016',
            model: '03_Statue_Pillls_3.glb',
            title: 'Where it all began',
            description: 'The Biden administration has called on major companies to help fight the pandemic. Big chains want to get past the holiday staffing crunch first.',
            sound: '',
        },
        {
            coords:{lat:52.507222, lng:13.145833},
            city:'Berlin',
            year: '2016',
            model: '03_Statue_Pillls_3.glb',
            title: 'Where it all began',
            description: 'The Biden administration has called on major companies to help fight the pandemic. Big chains want to get past the holiday staffing crunch first.',
            sound: '',
        },
        {
            coords:{lat:37.783333, lng:-122.416667},
            city:'San Francisco',
            year: '2016',
            model: '03_Statue_Pillls_3.glb',
            title: 'Where it all began',
            description: 'The Biden administration has called on major companies to help fight the pandemic. Big chains want to get past the holiday staffing crunch first.',
            sound: '',
        },
    ],

}

export default vars;