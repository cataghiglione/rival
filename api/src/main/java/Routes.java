
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.gson.Gson;
import json.JsonParser;
import model.Auth;
import model.AuthRequest;
import model.RegistrationUserForm;
import model.User;
import repository.Users;
import spark.Request;
import spark.Response;
import spark.Route;
import spark.Spark;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import static java.util.concurrent.TimeUnit.MINUTES;
import static json.JsonParser.toJson;
import static spark.Spark.*;

public class Routes {
    public static final String REGISTER_ROUTE = "/register";
    public static final String USERS_ROUTE = "/users";
    public static final String USER_ROUTE = "/user";
    public static final String AUTH_ROUTE = "/auth";


    private MySystem system;
    private static final Gson gson = new Gson();
    private final EntityManagerFactory entityManagerFactory = Persistence.createEntityManagerFactory("rmatch");


    public void create(MySystem system) {
        this.system = system;
        routes();
    }

    private void routes() {
        before((req, resp) -> {
            resp.header("Access-Control-Allow-Origin", "*");
            resp.header("Access-Control-Allow-Headers", "*");
            resp.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, PATCH, OPTIONS");
        });
        options("/*", (req, resp) -> {
            resp.status(200);
            return "ok";
        });

        post(REGISTER_ROUTE, (req, res) -> {
            final RegistrationUserForm form = RegistrationUserForm.createFromJson(req.body());

            system.registerUser(form).ifPresentOrElse(
                    (user) -> {
                        res.status(201);
                        res.body("user created");
                    },
                    () -> {
                        res.status(409);
                        res.body("username or email already exists");
                    }
            );

            return res.body();
        });
        post(AUTH_ROUTE, (req, res) -> {
            final AuthRequest authReq = AuthRequest.createFromJson(req.body());

            authenticate(authReq)
                    .ifPresentOrElse(token -> {
                        res.status(201);
                        res.body(toJson(Auth.create(token)));
                    }, () -> {
                        res.status(401);
                        res.body("");
                    });

            return res.body();
        });
        authorizedDelete(AUTH_ROUTE, (req, res) -> {
            getToken(req)
                    .ifPresentOrElse(token -> {
                        emailByToken.invalidate(token);
                        res.status(204);
                    }, () -> {
                        res.status(404);
                    });

            return "";

        });
        authorizedGet(USERS_ROUTE, (req, res) -> {
            final List<User> users = system.listUsers();
            return JsonParser.toJson(users);
        });
        authorizedGet(USER_ROUTE+"/:mail", (req, res) -> {
            final String mail = req.params("mail");
            AtomicReference<User> user = null;
            system.findUserByEmail(mail).ifPresentOrElse(
                    (user1) -> {
                        res.status(200);
                        user.set(user1);
                    },
                    () -> {
                        res.status(409);
                        req.body();
                    }
            );
            if(user.get() != null){
                return JsonParser.toJson(user);
            }
            return req.body();
        });
        authorizedGet(USER_ROUTE, (req, res) -> getToken(req).map(JsonParser::toJson));
        Spark.get("/getAllUsers", "application/json", (req, resp) -> {
            resp.type("application/json");
            resp.status(200);
            final EntityManager entityManager = entityManagerFactory.createEntityManager();
            final Users users = new Users(entityManager);

//            try {
//
//            }catch (SQL) {
//                resp.status(409);
//                resp.body("ee");
//            }
            return gson.toJson(users.listAll());
        });
    }

    private void authorizedGet(final String path, final Route route) {
        get(path, (request, response) -> authorize(route, request, response));
    }

    private void authorizedDelete(final String path, final Route route) {
        delete(path, (request, response) -> authorize(route, request, response));
    }

    private Object authorize(Route route, Request request, Response response) throws Exception {
        if (isAuthorized(request)) {
            return route.handle(request, response);
        } else {
            response.status(401);
            return "Unauthorized";
        }
    }

    private Optional<User> getUser(Request req) {
        return getToken(req)
                .map(emailByToken::getIfPresent)
                .flatMap(email -> system.findUserByEmail(email));
    }

    private final Cache<String, String> emailByToken = CacheBuilder.newBuilder()
            .expireAfterAccess(30, MINUTES)
            .build();

    private Optional<String> authenticate(AuthRequest req) {
        return system.findUserByEmail(req.getEmail()).flatMap(foundUser -> {
            if (system.validPassword(req.getPassword(), foundUser)) {
                final String token = UUID.randomUUID().toString();
                emailByToken.put(token, foundUser.getEmail());
                return Optional.of(token);
            } else {
                return Optional.empty();
            }
        });
    }

    private boolean isAuthorized(Request request) {
        return getToken(request).map(this::isAuthenticated).orElse(false);
    }

    private static Optional<String> getToken(Request request) {
        return Optional.ofNullable(request.headers("Authorization"))
                .map(Routes::getTokenFromHeader);
    }

    private static String getTokenFromHeader(String authorizationHeader) {
        return authorizationHeader.replace("Bearer ", "");
    }

    private boolean isAuthenticated(String token) {
        return emailByToken.getIfPresent(token) != null;
    }

}







