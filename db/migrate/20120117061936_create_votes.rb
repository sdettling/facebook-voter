class CreateVotes < ActiveRecord::Migration
  def change
    create_table :votes do |t|
      t.integer :voter
      t.integer :movie
      t.integer :type

      t.timestamps
    end
  end
end
