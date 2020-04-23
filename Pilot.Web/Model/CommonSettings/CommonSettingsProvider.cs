using System.Collections.Generic;
using System.Linq;
using Ascon.Pilot.DataClasses;
using Ascon.Pilot.Server.Api.Contracts;

namespace Pilot.Web.Model.CommonSettings
{
    public interface ICommonSettingsProvider
    {
        ICommonSettings GetSetting(string key);
    }

    public interface ICommonSettings
    {
        string Personal { get; }
        IReadOnlyCollection<string> Common { get; }
    }

    public class CommonSettingsProvider : ICommonSettingsProvider
    {
        private readonly Dictionary<string, ICommonSettings> _settings = new Dictionary<string, ICommonSettings>();
        private readonly INPerson _person;

        public CommonSettingsProvider(IServerApi serverApi, INPerson person)
        {
            INSettings personalSettings = serverApi.GetPersonalSettings();
            _person = person;
            ReloadSettings(personalSettings);
        }

        public ICommonSettings GetSetting(string key)
        {
            return _settings.TryGetValue(key, out var value) ? value : CommonSettings.Null;
        }

        private void ReloadSettings(INSettings settings)
        {
            if (_person == null)
                return;

            var newSettings = new Dictionary<string, CommonSettings>();
            foreach (var personalSetting in settings.PersonalSettings.SelectMany(x => x.Value.Values))
            {
                if (!newSettings.TryGetValue(personalSetting.Key, out var value))
                {
                    value = new CommonSettings();
                    newSettings[personalSetting.Key] = value;
                }
                value.Personal = personalSetting.Value;
            }

            foreach (var orgUnitId in _person.AllOrgUnits)
            {
                if (!settings.CommonSettings.TryGetValue(orgUnitId, out var commonSettings))
                    continue;

                foreach (var setting in commonSettings.Values)
                {
                    if (!newSettings.TryGetValue(setting.Key, out var value))
                    {
                        value = new CommonSettings();
                        newSettings[setting.Key] = value;
                    }
                    value.Common.Add(setting.Value);
                }
            }
            UpdateSettings(newSettings);
        }

        private void UpdateSettings(Dictionary<string, CommonSettings> settings)
        {
            foreach (var value in settings)
            {
                var newValue = value.Value;
                _settings[value.Key] = newValue;
            }

            foreach (var removedKey in _settings.Keys.Except(settings.Keys).Where(x => x != null).ToList())
            {
                _settings.Remove(removedKey);
            }
        }
    }
}
