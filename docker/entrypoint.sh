#!/bin/bash

# plugin enable
kolibri plugin enable kolibri.plugins.app
kolibri plugin disable kolibri.plugins.learn
kolibri plugin enable kolibri_explore_plugin

# Ensure that db is created and updated with the current kolibri version
kolibri manage migrate
# Collect statics to ensure they are updated
kolibri manage collectstatic --clear --noinput

kolibri services --background

rm -rf $KOLIBRI_HOME/populated
rm -rf $KOLIBRI_HOME/content

# Initial populate
if [ ! -e $KOLIBRI_HOME/populated ]
then
    # populate initial content
    /docker/populate/populate.sh &
    echo "done" > $KOLIBRI_HOME/populated
fi

uwsgi --ini uwsgi.ini
