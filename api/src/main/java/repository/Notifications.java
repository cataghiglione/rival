package repository;

import model.Match;
import model.Notification;
import model.Search;
import model.User;

import javax.persistence.EntityManager;
import java.util.List;
import java.util.Optional;

public class Notifications {
    private final EntityManager entityManager;

    public Notifications(EntityManager entityManager) {
        this.entityManager = entityManager;
    }
    public Notification createNotification(User user, String message, int code_id) {
        final Notification newNotification = Notification.create(user, message, code_id);
        entityManager.persist(newNotification);
        return newNotification;
    }
    public List<Notification> list(long user_id) {
        return entityManager.createQuery("SELECT n FROM Notification n WHERE cast(n.user.id as string) LIKE :id", Notification.class)
                .setParameter("id", Long.toString(user_id))
                .getResultList();
    }

}
