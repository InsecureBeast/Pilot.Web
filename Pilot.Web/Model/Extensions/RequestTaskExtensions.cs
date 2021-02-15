using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Pilot.Web.Model.Extensions
{
    static class RequestTaskExtensions
    {
        public static async Task<T> RunAsyncWithCancel<T>(this CancellationToken token, Func<T> function)
        {
            return await Task.Run(() =>
            {
                try
                {
                    using (token.Register(Thread.CurrentThread.Abort))
                    {
                        return function();
                    }
                }
                catch (ThreadAbortException)
                {
                    throw new OperationCanceledException();
                }
            }, token);
        }

        public static async Task<T> RunAsyncWithTimeout<T>(this CancellationToken token, Func<T> function, TimeSpan timeout)
        {
            using (var timeoutCancellation = new CancellationTokenSource())
            using (var combinedCancellation = CancellationTokenSource.CreateLinkedTokenSource(token, timeoutCancellation.Token))
            {
                var originalTask = token.RunAsyncWithCancel(function);
                var delayTask = Task.Delay(timeout, timeoutCancellation.Token);
                var completedTask = await Task.WhenAny(originalTask, delayTask);

                timeoutCancellation.Cancel();
                if (completedTask == originalTask)
                {
                    return await originalTask;
                }
                else
                {
                    throw new TimeoutException();
                }
            }
        }
    }
}
