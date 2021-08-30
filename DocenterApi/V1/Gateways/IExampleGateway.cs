using System.Collections.Generic;
using DocenterApi.V1.Domain;

namespace DocenterApi.V1.Gateways
{
    public interface IExampleGateway
    {
        Entity GetEntityById(int id);

        List<Entity> GetAll();
    }
}
