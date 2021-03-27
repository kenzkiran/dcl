var CommonConfigs = require("../../server/CommonConfigs.json");
module.exports = {
    baseUrl: '/api/',
    battingStyles: CommonConfigs.BattingStyles,
    bowlingStyles: CommonConfigs.BowlingStyles,
    tossChoices: CommonConfigs.TossChoices,
    batsmanStatus: CommonConfigs.BatsmanStatus,
    ageGroups: CommonConfigs.AgeGroups,
    genders: CommonConfigs.Gender,
    MinRequiredPlayers: CommonConfigs.MinRequiredPlayers,
    PlayersPageSize: CommonConfigs.PlayersPageSize,
    matchStatus: CommonConfigs.MatchStatus,
    gameTypes: CommonConfigs.GameTypes,
    T20MaxOvers: 20,
    UmpireCertificationLevels: CommonConfigs.UmpireCertificationLevels,
    teamRoles: CommonConfigs.TeamRoles,
    matchTypes: CommonConfigs.MatchTypes,
    scoresheetStatus: CommonConfigs.ScoresheetStatus,
    winPoints: CommonConfigs.WinPoints,
    tiePoints: CommonConfigs.TiePoints,
    AdminTask: CommonConfigs.AdminTasks
};