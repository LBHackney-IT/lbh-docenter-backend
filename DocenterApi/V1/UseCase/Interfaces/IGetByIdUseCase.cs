using DocenterApi.V1.Boundary.Response;

namespace DocenterApi.V1.UseCase.Interfaces
{
    public interface IGetByIdUseCase
    {
        ResponseObject Execute(int id);
    }
}
