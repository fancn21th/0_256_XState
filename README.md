# How to

## setup postgresql with docker

```bash
docker run --name nextjs-postgres \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_DB=mydatabase \
  -v pgdata:/YOUR-PATH \
  -p 5432:5432 \
  -d postgres
```
