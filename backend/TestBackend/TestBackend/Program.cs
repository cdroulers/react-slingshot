using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using MyCouch;
using MyCouch.Requests;
using Newtonsoft.Json;

namespace TestBackend
{
  public class Program
  {
    public static void Main(string[] args)
    {

      DoThings("user1", "user2");
      DoThings("user2", "user1");

      var host = new WebHostBuilder()
          .UseKestrel()
          .UseContentRoot(Directory.GetCurrentDirectory())
          .UseIISIntegration()
          .UseStartup<Startup>()
          .UseApplicationInsights()
          .Build();
      host.Run();
    }

    public static async Task DoThings(string from, string to)
    {
      var fromInfo = new DbConnectionInfo("http://localhost:5984/", from)
      {
        Timeout = TimeSpan.FromMilliseconds(System.Threading.Timeout.Infinite)
      };
      var toInfo = new DbConnectionInfo("http://localhost:5984/", to);
      using (var client = new MyCouchClient(fromInfo))
      {
        var doc = await client.Documents.GetAsync("all");

        var getChangesRequest = new GetChangesRequest
        {
          Feed = ChangesFeed.Continuous,
          IncludeDocs = true,
          Since = "now", //Optional: FROM WHAT SEQUENCE DO WE WANT TO START CONSUMING
          Heartbeat = 3000 //Optional: LET COUCHDB SEND A I AM ALIVE BLANK ROW EACH ms
        };

        var cancellation = new CancellationTokenSource();
        var response = await client.Changes.GetAsync(
            getChangesRequest,
            data => ProcessData(data, toInfo),
            cancellation.Token);
      }
    }

    public static Task ProcessData(string data, DbConnectionInfo toInfo)
    {
      if (string.IsNullOrWhiteSpace(data))
      {
        return Task.CompletedTask;
      }

      var parsed = JsonConvert.DeserializeObject<dynamic>(data);
      if (parsed.doc.type == "action")
      {
        // Ready to do something!
        switch ((string)parsed.doc.name)
        {
          case "updateCase":
            return DoUpdateCase(parsed.doc, toInfo);

          case "createCase":
            return DoCreateCase(parsed.doc, toInfo);
        }
      }

      return Task.CompletedTask;
    }

    private static async Task DoCreateCase(dynamic parsed, DbConnectionInfo toInfo)
    {
      var id = (string)parsed.parameters._id;
      var createName = (string)parsed.parameters.name;
      using (var client = new MyCouchClient(toInfo))
      {
        await client.Documents.PutAsync(id, JsonConvert.SerializeObject(new
        {
          name = createName,
          type = "case"
        }));
      }
    }

    private static async Task DoUpdateCase(dynamic parsed, DbConnectionInfo toInfo)
    {
      var id = (string)parsed.parameters._id;
      var updateName = (string)parsed.parameters.name;

      using (var client = new MyCouchClient(toInfo))
      {
        var doc = await client.Documents.GetAsync(id);
        var docParsed = JsonConvert.DeserializeObject<dynamic>(doc.Content);
        docParsed.name = updateName;
        var response = await client.Documents.PutAsync(id, doc.Rev, JsonConvert.SerializeObject(docParsed));
      }
    }
  }
}
