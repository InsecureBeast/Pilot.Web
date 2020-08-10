using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Ascon.Pilot.DataClasses;

namespace Pilot.Web.Model.DataObjects
{
    public class PUserState
    {
        public PUserState(INUserState userState)
        {
            Id = userState.Id;
            Name = userState.Name;
            Title = userState.Title;
            Color = userState.Color;
            IsDeleted = userState.IsDeleted;
            IsCompletionState = userState.IsCompletionState;
            IsSystemState = userState.IsSystemState;

            if (userState.Icon != null)
                Icon = Convert.ToBase64String(userState.Icon);
        }

        public MUserState Dto { get; }
        public Guid Id { get; }
        public string Name { get; }
        public string Title { get; }
        public string Icon { get; }
        public UserStateColors Color { get; }
        public bool IsDeleted { get; }
        public bool IsCompletionState { get; }
        public bool IsSystemState { get; }
    }
}
